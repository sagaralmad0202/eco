// Validates req.body / req.query / req.params against a zod schema and
// replaces them with the parsed result.
//
// After validation the object contains only the fields you declared,
// correctly typed. A client cannot sneak "role": "ADMIN" into a
// registration payload, because zod strips unknown keys.
//
// Why defineProperty instead of "req.query = data":
// Express 4 defines req.query as a GETTER on the request prototype, with no
// setter. A plain assignment to it is silently ignored in non-strict mode —
// validation would appear to pass while req.query kept its raw string values
// and every default (page, limit) went missing. defineProperty creates an own
// property on the instance that shadows the prototype getter, which works for
// query, body and params alike.

module.exports = function validate(schema, source = "body") {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return next(result.error); // handled by errorHandler as a ZodError
    }

    const key = `validated${source.charAt(0).toUpperCase() + source.slice(1)}`;
    req[key] = result.data;

    try {
      Object.defineProperty(req, source, {
        value: result.data,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    } catch {
      req[source] = result.data;
    }

    next();
  };
};
