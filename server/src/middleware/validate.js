/**
 * Zod Validation Middleware
 * Validates request body, query, or params against a Zod schema
 * Returns clear, user-friendly error messages
 */
export const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        const data = source === 'body' ? req.body
            : source === 'query' ? req.query
                : source === 'params' ? req.params
                    : req.body;

        const result = schema.safeParse(data);

        if (!result.success) {
            const errors = result.error.issues.map(issue => ({
                field: issue.path.join('.'),
                message: issue.message
            }));

            return res.status(400).json({
                error: 'Validation Error',
                message: 'Please check your input and try again.',
                details: errors
            });
        }

        // Attach validated (and transformed) data
        if (source === 'body') req.validatedBody = result.data;
        else if (source === 'query') req.validatedQuery = result.data;
        else if (source === 'params') req.validatedParams = result.data;

        next();
    };
};
