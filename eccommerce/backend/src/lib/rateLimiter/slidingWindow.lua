-- Sliding log: accepted admissions in (Redis time - window, Redis time].
-- One atomic script, one sorted set, at most limit entries per key.
local clock = redis.call('TIME')
local now = tonumber(clock[1]) * 1000.0 + math.floor(tonumber(clock[2]) / 1000)
local key = KEYS[1]
local window = tonumber(ARGV[1])
local limit = tonumber(ARGV[2])
local member = ARGV[3]
redis.call('ZREMRANGEBYSCORE', key, '-inf', now - window)
local count = redis.call('ZCARD', key)
local allowed = 0
if count < limit then
    redis.call('ZADD', key, now, member)
    redis.call('PEXPIRE', key, window)
    count = count + 1
    allowed = 1
end
local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
local nextSlot = tonumber(oldest[2]) + window
local retryAfter = 0
if allowed == 0 then
    retryAfter = math.max(1, math.ceil((nextSlot - now) / 1000))
end
return { allowed, math.max(0, limit - count), retryAfter, math.ceil(nextSlot / 1000) }
