-- One bounded hash per HMAC account identity. Outstanding attempts reserve
-- capacity before bcrypt. Unanswered leases become failures at their expiry;
-- Redis time and TTL retain enough history to account for delayed completions.
-- ARGV: operation, limit, failure window ms, cooldown ms, lease ms,
--       reservation id, generation (candidate for acquire, expected for finish).
local key = KEYS[1]
local operation = ARGV[1]
local limit = tonumber(ARGV[2])
local window = tonumber(ARGV[3])
local cooldown = tonumber(ARGV[4])
local lease = tonumber(ARGV[5])
local reservation = 'pending:' .. ARGV[6]
local requestedGeneration = ARGV[7]
local serverTime = redis.call('TIME')
local now = tonumber(serverTime[1]) * 1000.0 + math.floor(tonumber(serverTime[2]) / 1000)

local generation = redis.call('HGET', key, 'generation')
local failures = tonumber(redis.call('HGET', key, 'failures') or '0')
local windowStart = tonumber(redis.call('HGET', key, 'windowStart') or '0')
local blockedUntil = tonumber(redis.call('HGET', key, 'blockedUntil') or '0')
local pending = 0
local live = {}
local expired = {}
local entries = redis.call('HGETALL', key)
for index = 1, #entries, 2 do
    if string.sub(entries[index], 1, 8) == 'pending:' then
        local item = { field = entries[index], expiresAt = tonumber(entries[index + 1]) }
        if item.expiresAt <= now then
            table.insert(expired, item)
        else
            table.insert(live, item)
            pending = pending + 1
        end
    end
end
local function byExpiry(a, b) return a.expiresAt < b.expiresAt end
table.sort(expired, byExpiry)
table.sort(live, byExpiry)

local function advance(at)
    if blockedUntil > 0 then
        if blockedUntil <= at then
            failures = 0
            windowStart = 0
            blockedUntil = 0
        end
    elseif windowStart > 0 and windowStart + window <= at then
        failures = 0
        windowStart = 0
    end
end

local function addFailure(at)
    advance(at)
    -- Neither denied checks nor work expiring during a cooldown extends it.
    if blockedUntil > at then return end
    if failures == 0 then windowStart = at end
    failures = failures + 1
    if failures >= limit then blockedUntil = at + cooldown end
end

-- Replay overdue lease events in time order. Using now here would incorrectly
-- resurrect an already-finished cooldown when this account has been idle.
for _, item in ipairs(expired) do
    redis.call('HDEL', key, item.field)
    addFailure(item.expiresAt)
end
advance(now)

local function persist()
    if failures == 0 and pending == 0 and blockedUntil == 0 then
        redis.call('DEL', key)
        generation = false
        return
    end
    redis.call('HSET', key, 'failures', failures, 'windowStart', windowStart, 'blockedUntil', blockedUntil)
    local expiresAt = blockedUntil
    if failures > 0 then expiresAt = math.max(expiresAt, windowStart + window) end
    for _, item in ipairs(live) do
        -- A reservation must outlive its lease so a crashed/slow login cannot
        -- evade a failure. Beyond both horizons it can no longer affect access.
        expiresAt = math.max(expiresAt, item.expiresAt + math.max(window, cooldown))
    end
    redis.call('PEXPIRE', key, math.max(1, expiresAt - now))
end

local function nextSlot()
    if blockedUntil > now then return blockedUntil end
    if failures + pending < limit then
        if failures > 0 then return windowStart + window end
        return now
    end
    -- Project unanswered leases into failures to report when capacity returns;
    -- an ordinary completion may release it sooner.
    local projectedFailures = failures
    local projectedWindow = windowStart
    for _, item in ipairs(live) do
        if projectedFailures > 0 and projectedWindow + window <= item.expiresAt then
            return projectedWindow + window
        end
        if projectedFailures == 0 then projectedWindow = item.expiresAt end
        projectedFailures = projectedFailures + 1
        if projectedFailures >= limit then return item.expiresAt + cooldown end
    end
    return math.max(now, projectedWindow + window)
end

local function response(allowed)
    local nextTime = nextSlot()
    local remaining = math.max(0, limit - failures - pending)
    local retryAfter = 0
    if allowed == 0 then retryAfter = math.max(1, math.ceil((nextTime - now) / 1000)) end
    return { allowed, remaining, retryAfter, math.ceil(nextTime / 1000), generation or '' }
end

-- Finishes require the original LIVE reservation. A stale success cannot issue
-- a session after its lease expired, or mutate the next generation's failures.
if operation ~= 'acquire' then
    if generation ~= requestedGeneration or redis.call('HEXISTS', key, reservation) == 0 then
        persist()
        return response(0)
    end
    redis.call('HDEL', key, reservation)
    pending = pending - 1
    for index, item in ipairs(live) do
        if item.field == reservation then
            table.remove(live, index)
            break
        end
    end
    if operation == 'success' then
        -- Retain live peers: two timely valid logins may both finish normally.
        failures = 0
        windowStart = 0
        blockedUntil = 0
    elseif operation == 'failure' then
        addFailure(now)
    end
    -- Release (e.g. a prompt infrastructure failure) adds no strike.
    persist()
    return response(1)
end

if blockedUntil > now or failures + pending >= limit then
    persist()
    return response(0)
end
if failures == 0 and pending == 0 then
    redis.call('DEL', key)
    generation = false
end
if not generation then
    generation = requestedGeneration
    redis.call('HSET', key, 'generation', generation)
end
local expiresAt = now + lease
redis.call('HSET', key, reservation, expiresAt)
pending = pending + 1
table.insert(live, { field = reservation, expiresAt = expiresAt })
table.sort(live, byExpiry)
persist()
return response(1)
