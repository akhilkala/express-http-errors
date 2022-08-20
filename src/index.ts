import { Request, Response, NextFunction } from "express";

enum HttpStatusCode {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  PAYMENT_REQUIRED = 402,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  NOT_ACCEPTABLE = 406,
  PROXY_AUTHENTICATION_REQIRED = 407,
  REQUEST_TIMEOUT = 408,
  CONFLICT = 409,
  GONE = 410,
  LENGTH_REQUIRED = 411,
  PRECONDITION_FAILED = 412,
  PAYLOAD_TOO_LARGE = 413,
  URI_TOO_LONG = 414,
  INTERNAL_SERVER = 500,
}

type Route = (req: Request, res: Response, next: NextFunction) => any;

export const catcher =
  (fn: Route) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

class HTTPError extends Error {
  public readonly httpCode: number;
  public readonly name: string;
  public readonly message: string;
  public readonly customResponse: any;

  constructor(
    httpCode: number,
    name: string,
    message = "",
    customResponse: any = undefined
  ) {
    super(message);
    this.httpCode = httpCode;
    this.name = name;
    this.message = message;
    this.customResponse = customResponse;
    Object.setPrototypeOf(this, HTTPError.prototype);
  }
}

export const errorHandler =
  (
    callback?: (
      err: any,
      req: Request,
      res: Response,
      next: NextFunction
    ) => any | Promise<any>
  ) =>
  async (err: any, req: Request, res: Response, next: NextFunction) => {
    if (!!callback) {
      const returnValue = await callback(err, req, res, next);
      if (returnValue) return returnValue;
    }

    if (!err.httpCode) {
      console.log(err);
      return res.status(500).json({
        statusCode: 500,
        message: `Something went wrong : ${err.message}`,
        path: req.path,
        method: req.method,
      });
    }
    if (!!err.customResponse) {
      return res.status(err.httpCode).json(err.customResponse);
    }
    res.status(err.httpCode).json({
      statusCode: err.httpCode,
      name: err.name,
      message: err.message ? err.message : undefined,
      path: req.path,
      method: req.method,
    });
  };

export const notFoundHandler =
  (
    callback?: (
      req: Request,
      res: Response,
      next: NextFunction
    ) => any | Promise<any>
  ) =>
  async (req: Request, res: Response, next: NextFunction) => {
    if (!!callback) {
      const returnValue = await callback(req, res, next);
      if (returnValue) return returnValue;
    }
    next(new NotFoundError());
  };

export class CustomError<T> extends HTTPError {
  constructor(statusCode: number, response: T) {
    super(statusCode, "", "", response);
  }
}

export class BadRequestError extends HTTPError {
  constructor(message?: string) {
    super(HttpStatusCode.BAD_REQUEST, "Bad Request", message);
  }
}

export class UnauthorizedError extends HTTPError {
  constructor(message?: string) {
    super(HttpStatusCode.UNAUTHORIZED, "Unauthorized", message);
  }
}

export class PaymentRequiredError extends HTTPError {
  constructor(message?: string) {
    super(HttpStatusCode.PAYMENT_REQUIRED, "Payment Required", message);
  }
}

export class ForbiddenError extends HTTPError {
  constructor(message?: string) {
    super(HttpStatusCode.FORBIDDEN, "Forbidden", message);
  }
}

export class NotFoundError extends HTTPError {
  constructor(message?: string) {
    super(HttpStatusCode.NOT_FOUND, "Not Found", message);
  }
}

export class ConflictError extends HTTPError {
  constructor(message?: string) {
    super(HttpStatusCode.CONFLICT, "Conflict", message);
  }
}

export class InternalServerError extends HTTPError {
  constructor(message?: string) {
    super(HttpStatusCode.INTERNAL_SERVER, "Internal Server", message);
  }
}

export class MethodNotAllowedError extends HTTPError {
  constructor(message?: string) {
    super(HttpStatusCode.METHOD_NOT_ALLOWED, "Method Not Allowed", message);
  }
}

export class NotAcceptableError extends HTTPError {
  constructor(message?: string) {
    super(HttpStatusCode.NOT_ACCEPTABLE, "Not Acceptable", message);
  }
}

export class ProxyAuthenticationRequiredError extends HTTPError {
  constructor(message?: string) {
    super(
      HttpStatusCode.PROXY_AUTHENTICATION_REQIRED,
      "Proxy Authentication Required",
      message
    );
  }
}

export class RequestTimeoutError extends HTTPError {
  constructor(message?: string) {
    super(HttpStatusCode.REQUEST_TIMEOUT, "Request Timeout", message);
  }
}

export class GoneError extends HTTPError {
  constructor(message?: string) {
    super(HttpStatusCode.GONE, "Gone", message);
  }
}

export class LengthRequiredError extends HTTPError {
  constructor(message?: string) {
    super(HttpStatusCode.LENGTH_REQUIRED, "Length Required", message);
  }
}

export class PreconditionFailedError extends HTTPError {
  constructor(message?: string) {
    super(HttpStatusCode.PRECONDITION_FAILED, "Precondition Failed", message);
  }
}

export class PayloadTooLargeError extends HTTPError {
  constructor(message?: string) {
    super(HttpStatusCode.PAYLOAD_TOO_LARGE, "Payload Too Large", message);
  }
}

export class URITooLongError extends HTTPError {
  constructor(message?: string) {
    super(HttpStatusCode.URI_TOO_LONG, "URI Too Long", message);
  }
}
