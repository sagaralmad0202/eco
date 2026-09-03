-- Atomic Sliding Window Rate Limiter via Redis Sorted Set (ZSET)
-- KEYS[1]: Rate limit Redis key (e.g. rate_limit:auth:ip:127.0.0.1:POST:/api/auth/login)
-- ARGV[1]: Current timestamp in milliseconds
-- ARGV[2]: Window duration in milliseconds
-- ARGV[3]: Maximum requests allowed in the window
-- ARGV[4]: Unique request identifier (timestamp:uuid)
-- ARGV[5]: Key expiration TTL in seconds

local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local member = ARGV[4]
local ttl = tonumber(ARGV[5])

local windowStart = now - window

-- 1. Evict entries outside the sliding window
redis.call('ZREMRANGEBYSCORE', key, '-inf', windowStart)

-- 2. Count requests currently in the window
local currentCount = redis.call('ZCARD', key)

-- 3. Evaluate limit
if currentCount < limit then
    -- Record this request
    redis.call('ZADD', key, now, member)
    redis.call('EXPIRE', key, ttl)
    local remaining = limit - currentCount - 1
    local resetTime = math.ceil((now + window) / 1000)
    return { 1, remaining, 0, resetTime }
else
    -- Find the oldest element in the window to calculate exact seconds until a slot opens
    local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
    local retryAfter = 1
    local resetTime = math.ceil((now + window) / 1000)
    if #oldest >= 2 then
        local oldestScore = tonumber(oldest[2])
        local earliestAllowed = oldestScore + window
        retryAfter = math.ceil((earliestAllowed - now) / 1000)
        if retryAfter < 1 then
            retryAfter = 1
        end
        resetTime = math.ceil(earliestAllowed / 1000)
    end
    return { 0, 0, retryAfter, resetTime }
end
