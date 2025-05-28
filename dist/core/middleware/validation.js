import { ERRORS } from '../utils/errors.js';
export const validate = (schema, source = 'query') => {
    return async (req, _res, next) => {
        console.log('req.body', req.body);
        try {
            const result = await schema.safeParseAsync(req[source]);
            console.log('result', result);
            if (!result.success) {
                const firstIssue = result.error.issues[0];
                const errorDetail = {
                    field: firstIssue.path.join('.'),
                    code: firstIssue.code,
                    message: firstIssue.message,
                    source,
                    ...('received' in firstIssue && { received: firstIssue.received }),
                    ...('expected' in firstIssue && { expected: firstIssue.expected }),
                };
                throw ERRORS.badRequest('Invalid request data', errorDetail);
            }
            req[source === 'query' ? 'validatedQuery' : source] = result.data;
            next();
        }
        catch (err) {
            next(err);
        }
    };
};
