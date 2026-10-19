// Generated from openapi/openapi-v1.7.0.json (sha256 b74a80b7e31c89b63abb1ef6d01cff0bfa404e79c1790c21a42765a36c97af7d) by npm run api:generate.
// Do not edit by hand.
export interface paths {
    "/api/v1/admin/nutritionists": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Provisiona un nuevo nutricionista pendiente de activación y pide a Keycloak que le envíe el enlace
         *     para definir su contraseña (acta A52). El header `Location` apunta al recurso creado.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Datos del nutricionista. */
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["CreateNutritionistRequest"];
                    "text/json": components["schemas"]["CreateNutritionistRequest"];
                    "application/*+json": components["schemas"]["CreateNutritionistRequest"];
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CreateNutritionistResult"];
                        "application/json": components["schemas"]["CreateNutritionistResult"];
                        "text/json": components["schemas"]["CreateNutritionistResult"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Bad Gateway */
                502: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/nutritionists/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Devuelve el resumen de una cuenta de nutricionista, incluido su estado (acta A49). Permite verificar
         *     si el nutricionista ya activó su cuenta.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Identificador local del nutricionista. */
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["GetNutritionistResult"];
                        "application/json": components["schemas"]["GetNutritionistResult"];
                        "text/json": components["schemas"]["GetNutritionistResult"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/nutritionists/{id}/activation-email": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Vuelve a enviar a un nutricionista pendiente el enlace para definir su contraseña (acta A52). Sirve
         *     cuando el enlace venció, porque dura 12 horas, o cuando el envío falló al provisionar la cuenta.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Identificador local del nutricionista. */
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description No Content */
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Bad Gateway */
                502: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/allergies": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lista el catálogo de alergias activas. */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["AllergyCatalogItem"][];
                        "application/json": components["schemas"]["AllergyCatalogItem"][];
                        "text/json": components["schemas"]["AllergyCatalogItem"][];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/register": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Registra un nuevo paciente. El cliente puede enviar opcionalmente el header
         *     `Idempotency-Key` (UUID v4) para compatibilidad futura.
         */
        post: {
            parameters: {
                query?: never;
                header?: {
                    /** @description Clave de idempotencia opcional. */
                    "Idempotency-Key"?: string;
                };
                path?: never;
                cookie?: never;
            };
            /** @description Datos del registro. */
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["RegisterPatientRequest"];
                    "text/json": components["schemas"]["RegisterPatientRequest"];
                    "application/*+json": components["schemas"]["RegisterPatientRequest"];
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["RegisterPatientResult"];
                        "application/json": components["schemas"]["RegisterPatientResult"];
                        "text/json": components["schemas"]["RegisterPatientResult"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Too Many Requests */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Bad Gateway */
                502: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Inicia sesión haciendo passthrough a Keycloak y devuelve los tokens emitidos. Ante
         *     credenciales inválidas responde 401 con un mensaje genérico (no revela si la cuenta existe).
         *     Es la ruta del móvil: solo admite el cliente `cauce-mobile`, y cualquier otro responde 400
         *     `unsupported_client`. El portal usa `/auth/portal/login` (acta A68).
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Credenciales y cliente OIDC. */
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["LoginRequest"];
                    "text/json": components["schemas"]["LoginRequest"];
                    "application/*+json": components["schemas"]["LoginRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["LoginResult"];
                        "application/json": components["schemas"]["LoginResult"];
                        "text/json": components["schemas"]["LoginResult"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Locked */
                423: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Too Many Requests */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Renueva la sesión a partir de un refresh token vigente. Devuelve un juego de tokens nuevo,
         *     incluida la identidad del usuario. El realm rota los refresh tokens: el enviado aquí queda
         *     revocado y el cliente debe persistir el que recibe. Solo admite el cliente `cauce-mobile`
         *     (acta A68).
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Refresh token y cliente OIDC. */
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["RefreshTokenRequest"];
                    "text/json": components["schemas"]["RefreshTokenRequest"];
                    "application/*+json": components["schemas"]["RefreshTokenRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["LoginResult"];
                        "application/json": components["schemas"]["LoginResult"];
                        "text/json": components["schemas"]["LoginResult"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Too Many Requests */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Cierra sesión revocando el refresh token en Keycloak. Solo admite el cliente `cauce-mobile`
         *     (acta A68).
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Refresh token y cliente OIDC. */
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["LogoutRequest"];
                    "text/json": components["schemas"]["LogoutRequest"];
                    "application/*+json": components["schemas"]["LogoutRequest"];
                };
            };
            responses: {
                /** @description No Content */
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/password-reset/request": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Solicita el restablecimiento de contraseña. Responde 200 exista o no la cuenta. */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Datos de la solicitud. */
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["RequestPasswordResetRequest"];
                    "text/json": components["schemas"]["RequestPasswordResetRequest"];
                    "application/*+json": components["schemas"]["RequestPasswordResetRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Too Many Requests */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/password-reset/confirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Confirma el restablecimiento de contraseña con el token recibido. */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Datos de la confirmación. */
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["ConfirmPasswordResetRequest"];
                    "text/json": components["schemas"]["ConfirmPasswordResetRequest"];
                    "application/*+json": components["schemas"]["ConfirmPasswordResetRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Too Many Requests */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/verification-email/resend": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Reenvía el correo de verificación de una cuenta. Responde 200 siempre que la petición supere la
         *     validación, exista o no la cuenta y esté o no verificada, para no revelar qué correos están
         *     registrados ni su estado.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Correo de la cuenta. */
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["ResendVerificationEmailRequest"];
                    "text/json": components["schemas"]["ResendVerificationEmailRequest"];
                    "application/*+json": components["schemas"]["ResendVerificationEmailRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Too Many Requests */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/clinical-notes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lista las notas clínicas del paciente autenticado en un rango de fechas. */
        get: {
            parameters: {
                query: {
                    /** @description Inicio del rango, obligatorio e inclusivo, sobre `createdAt`. Debe llevar zona horaria (`Z` u offset, como `2026-10-01T00:00:00-05:00`). */
                    from: string;
                    /** @description Fin del rango, obligatorio e inclusivo, sobre `createdAt`. Debe llevar zona horaria y no ser anterior a `from`. */
                    to: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ClinicalNoteSummary"][];
                        "application/json": components["schemas"]["ClinicalNoteSummary"][];
                        "text/json": components["schemas"]["ClinicalNoteSummary"][];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Too Many Requests */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        /** Crea una nota clínica del paciente autenticado, asociada a una comida o a un síntoma. */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Datos de la nota. */
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["CreateClinicalNoteRequest"];
                    "text/json": components["schemas"]["CreateClinicalNoteRequest"];
                    "application/*+json": components["schemas"]["CreateClinicalNoteRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CreateClinicalNoteResult"];
                        "application/json": components["schemas"]["CreateClinicalNoteResult"];
                        "text/json": components["schemas"]["CreateClinicalNoteResult"];
                    };
                };
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CreateClinicalNoteResult"];
                        "application/json": components["schemas"]["CreateClinicalNoteResult"];
                        "text/json": components["schemas"]["CreateClinicalNoteResult"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Too Many Requests */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/consent/current": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Devuelve la versión, el texto y el hash SHA-256 del documento de consentimiento vigente. El
         *     cliente debe enviar en `POST /api/v1/auth/register` exactamente la versión y el hash que
         *     recibe aquí; de lo contrario el registro se rechaza con 400 `consent_text_mismatch`.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CurrentConsentResult"];
                        "application/json": components["schemas"]["CurrentConsentResult"];
                        "text/json": components["schemas"]["CurrentConsentResult"];
                    };
                };
                /** @description Too Many Requests */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/custom-foods": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lista los alimentos personalizados del paciente autenticado. */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CustomFoodSummary"][];
                        "application/json": components["schemas"]["CustomFoodSummary"][];
                        "text/json": components["schemas"]["CustomFoodSummary"][];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Too Many Requests */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        /** Crea un alimento personalizado del paciente autenticado. */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Datos del alimento personalizado. */
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["CreateCustomFoodRequest"];
                    "text/json": components["schemas"]["CreateCustomFoodRequest"];
                    "application/*+json": components["schemas"]["CreateCustomFoodRequest"];
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CreateCustomFoodResult"];
                        "application/json": components["schemas"]["CreateCustomFoodResult"];
                        "text/json": components["schemas"]["CreateCustomFoodResult"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Too Many Requests */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/custom-foods/{customFoodId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Actualiza un alimento personalizado del paciente autenticado. Igual que en la creación, si los
         *     ingredientes coinciden con alergias declaradas y el paciente no lo confirmó, responde 409
         *     `unconfirmed_allergens` con el detalle (US10 CA03).
         */
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Identificador del alimento personalizado. */
                    customFoodId: string;
                };
                cookie?: never;
            };
            /** @description Campos a actualizar. */
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["UpdateCustomFoodRequest"];
                    "text/json": components["schemas"]["UpdateCustomFoodRequest"];
                    "application/*+json": components["schemas"]["UpdateCustomFoodRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["UpdateCustomFoodResult"];
                        "application/json": components["schemas"]["UpdateCustomFoodResult"];
                        "text/json": components["schemas"]["UpdateCustomFoodResult"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Too Many Requests */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        post?: never;
        /** Elimina un alimento personalizado del paciente autenticado. */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Identificador del alimento personalizado. */
                    customFoodId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description No Content */
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Too Many Requests */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/foods": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lista el catálogo de alimentos activos de forma paginada, con filtros opcionales. */
        get: {
            parameters: {
                query?: {
                    /** @description Número de página. */
                    page?: number;
                    /** @description Tamaño de página. */
                    pageSize?: number;
                    /** @description Filtro por categoría, opcional. */
                    category?: string;
                    /** @description Filtro por nivel FODMAP, opcional. */
                    fodmapLevel?: components["schemas"]["FodmapLevel"];
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["FoodItemSummaryPagedResult"];
                        "application/json": components["schemas"]["FoodItemSummaryPagedResult"];
                        "text/json": components["schemas"]["FoodItemSummaryPagedResult"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Too Many Requests */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/foods/search": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Busca alimentos del catálogo por coincidencia de nombre.
         * @description Devuelve como máximo 20 alimentos.
         */
        get: {
            parameters: {
                query: {
                    /** @description Texto a buscar en el nombre, obligatorio y no vacío. */
                    q: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["FoodItemSummary"][];
                        "application/json": components["schemas"]["FoodItemSummary"][];
                        "text/json": components["schemas"]["FoodItemSummary"][];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Too Many Requests */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/foods/suggestions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Devuelve sugerencias de alimentos para el paciente autenticado (US09 CA03): frecuentes en los
         *     últimos 30 días, registrados en las últimas 24 horas y una selección rotativa del catálogo.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["FoodSuggestionsResult"];
                        "application/json": components["schemas"]["FoodSuggestionsResult"];
                        "text/json": components["schemas"]["FoodSuggestionsResult"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Too Many Requests */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/foods/{foodId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Devuelve el detalle de un alimento del catálogo. */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Identificador del alimento. */
                    foodId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["FoodItemDetail"];
                        "application/json": components["schemas"]["FoodItemDetail"];
                        "text/json": components["schemas"]["FoodItemDetail"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Too Many Requests */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/glossary": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Devuelve todo el glosario ordenado alfabéticamente, con la definición apropiada al rol. */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["GlossaryResult"];
                        "application/json": components["schemas"]["GlossaryResult"];
                        "text/json": components["schemas"]["GlossaryResult"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Too Many Requests */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/glossary/search": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Busca términos del glosario por coincidencia de texto (insensible a mayúsculas y a tildes). */
        get: {
            parameters: {
                query: {
                    /** @description Texto a buscar, obligatorio y no vacío. */
                    q: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["GlossaryResult"];
                        "application/json": components["schemas"]["GlossaryResult"];
                        "text/json": components["schemas"]["GlossaryResult"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Too Many Requests */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Devuelve el estado de salud del servicio junto con la marca de tiempo UTC. */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Devuelve el historial unificado del paciente autenticado en un rango de fechas,
         *     ordenado cronológicamente de forma descendente.
         * @description Devuelve como máximo 500 comidas y 500 síntomas del rango; las notas clínicas no tienen tope.
         */
        get: {
            parameters: {
                query: {
                    /** @description Inicio del rango, obligatorio e inclusivo, con zona horaria (`Z` u offset). Filtra comidas y síntomas por `clientCreatedAt` y notas por `createdAt`. */
                    from: string;
                    /** @description Fin del rango, obligatorio e inclusivo, con zona horaria y no anterior a `from`. */
                    to: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": (components["schemas"]["MealHistoryEvent"] | components["schemas"]["SymptomHistoryEvent"] | components["schemas"]["ClinicalNoteHistoryEvent"])[];
                        "application/json": (components["schemas"]["MealHistoryEvent"] | components["schemas"]["SymptomHistoryEvent"] | components["schemas"]["ClinicalNoteHistoryEvent"])[];
                        "text/json": (components["schemas"]["MealHistoryEvent"] | components["schemas"]["SymptomHistoryEvent"] | components["schemas"]["ClinicalNoteHistoryEvent"])[];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Too Many Requests */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/ibs-sss": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Registra una evaluación IBS-SSS del paciente autenticado. El servidor calcula el
         *     puntaje total y la categoría; una evaluación de línea base cierra el onboarding.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Las cinco dimensiones y el tipo de evaluación. */
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["CreateIbsSssAssessmentRequest"];
                    "text/json": components["schemas"]["CreateIbsSssAssessmentRequest"];
                    "application/*+json": components["schemas"]["CreateIbsSssAssessmentRequest"];
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CreateIbsSssAssessmentResult"];
                        "application/json": components["schemas"]["CreateIbsSssAssessmentResult"];
                        "text/json": components["schemas"]["CreateIbsSssAssessmentResult"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Too Many Requests */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/ibs-sss/evolution": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Devuelve la evolución IBS-SSS del paciente autenticado. */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["IbsSssEvolutionEntry"][];
                        "application/json": components["schemas"]["IbsSssEvolutionEntry"][];
                        "text/json": components["schemas"]["IbsSssEvolutionEntry"][];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Too Many Requests */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/ibs-sss/latest": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Devuelve la evaluación IBS-SSS más reciente del paciente autenticado. */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["IbsSssAssessmentSummary"];
                        "application/json": components["schemas"]["IbsSssAssessmentSummary"];
                        "text/json": components["schemas"]["IbsSssAssessmentSummary"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Too Many Requests */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/invitations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Genera un nuevo código de invitación para el nutricionista autenticado. */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["GenerateInvitationCodeResult"];
                        "application/json": components["schemas"]["GenerateInvitationCodeResult"];
                        "text/json": components["schemas"]["GenerateInvitationCodeResult"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/meals": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Devuelve el historial paginado de comidas del paciente autenticado. */
        get: {
            parameters: {
                query: {
                    /** @description Inicio del rango, obligatorio e inclusivo, sobre `clientCreatedAt`. Debe llevar zona horaria (`Z` u offset, como `2026-10-01T00:00:00-05:00`). */
                    from: string;
                    /** @description Fin del rango, obligatorio e inclusivo, sobre `clientCreatedAt`. Debe llevar zona horaria y no ser anterior a `from`. */
                    to: string;
                    /** @description Número de página. */
                    page?: number;
                    /** @description Tamaño de página. */
                    pageSize?: number;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["MealHistoryItemPagedResult"];
                        "application/json": components["schemas"]["MealHistoryItemPagedResult"];
                        "text/json": components["schemas"]["MealHistoryItemPagedResult"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Too Many Requests */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        /**
         * Registra una comida del paciente autenticado. Es idempotente respecto del
         *     `client_guid`: un reintento con carga idéntica devuelve 200; una creación
         *     nueva devuelve 201.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Datos de la comida. */
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["CreateMealRequest"];
                    "text/json": components["schemas"]["CreateMealRequest"];
                    "application/*+json": components["schemas"]["CreateMealRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CreateMealResult"];
                        "application/json": components["schemas"]["CreateMealResult"];
                        "text/json": components["schemas"]["CreateMealResult"];
                    };
                };
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CreateMealResult"];
                        "application/json": components["schemas"]["CreateMealResult"];
                        "text/json": components["schemas"]["CreateMealResult"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Too Many Requests */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/recommendations/pending-review": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Lista, paginadas, las recomendaciones pendientes de revisión de los pacientes asignados. Cada fila
         *     incluye el identificador y el nombre completo del paciente (acta A69).
         */
        get: {
            parameters: {
                query?: {
                    /** @description Número de página. */
                    page?: number;
                    /** @description Tamaño de página. */
                    pageSize?: number;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["PendingReviewRecommendationDtoPagedResult"];
                        "application/json": components["schemas"]["PendingReviewRecommendationDtoPagedResult"];
                        "text/json": components["schemas"]["PendingReviewRecommendationDtoPagedResult"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Too Many Requests */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/recommendations/{id}/approve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Aprueba una recomendación con la nota clínica del nutricionista. Requiere el header
         *     `Idempotency-Key`.
         */
        post: {
            parameters: {
                query?: never;
                header?: {
                    /** @description Clave de idempotencia del header `Idempotency-Key`. */
                    "Idempotency-Key"?: string;
                };
                path: {
                    /** @description Identificador de la recomendación. */
                    id: string;
                };
                cookie?: never;
            };
            /** @description Nota clínica de aprobación. */
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["ApproveRecommendationRequest"];
                    "text/json": components["schemas"]["ApproveRecommendationRequest"];
                    "application/*+json": components["schemas"]["ApproveRecommendationRequest"];
                };
            };
            responses: {
                /** @description No Content */
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Too Many Requests */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/recommendations/{id}/reject": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Rechaza una recomendación con el motivo del nutricionista. Requiere el header
         *     `Idempotency-Key`.
         */
        post: {
            parameters: {
                query?: never;
                header?: {
                    /** @description Clave de idempotencia del header `Idempotency-Key`. */
                    "Idempotency-Key"?: string;
                };
                path: {
                    /** @description Identificador de la recomendación. */
                    id: string;
                };
                cookie?: never;
            };
            /** @description Motivo del rechazo. */
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["RejectRecommendationRequest"];
                    "text/json": components["schemas"]["RejectRecommendationRequest"];
                    "application/*+json": components["schemas"]["RejectRecommendationRequest"];
                };
            };
            responses: {
                /** @description No Content */
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Too Many Requests */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/recommendations/manual": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Crea manualmente una recomendación para un paciente asignado (US29). Queda aprobada de inmediato. */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Datos de la recomendación manual. */
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["CreateManualRecommendationRequest"];
                    "text/json": components["schemas"]["CreateManualRecommendationRequest"];
                    "application/*+json": components["schemas"]["CreateManualRecommendationRequest"];
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CreateManualRecommendationResult"];
                        "application/json": components["schemas"]["CreateManualRecommendationResult"];
                        "text/json": components["schemas"]["CreateManualRecommendationResult"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Too Many Requests */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/recommendations/{id}/modify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Aprueba una recomendación en revisión tras modificar sus ítems y/o su contenido (US17 CA03). Requiere
         *     el header `Idempotency-Key`, como aprobar y rechazar (acta A69).
         */
        post: {
            parameters: {
                query?: never;
                header?: {
                    /** @description Clave de idempotencia del header `Idempotency-Key`. */
                    "Idempotency-Key"?: string;
                };
                path: {
                    /** @description Identificador de la recomendación. */
                    id: string;
                };
                cookie?: never;
            };
            /** @description Cambios y nota clínica de la modificación. */
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["ModifyRecommendationRequest"];
                    "text/json": components["schemas"]["ModifyRecommendationRequest"];
                    "application/*+json": components["schemas"]["ModifyRecommendationRequest"];
                };
            };
            responses: {
                /** @description No Content */
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Too Many Requests */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/recommendations/{id}/archive": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Archiva una recomendación en un estado terminal aprobado (US30 CA01). */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Identificador de la recomendación. */
                    id: string;
                };
                cookie?: never;
            };
            /** @description Motivo del archivado. */
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["ArchiveRecommendationRequest"];
                    "text/json": components["schemas"]["ArchiveRecommendationRequest"];
                    "application/*+json": components["schemas"]["ArchiveRecommendationRequest"];
                };
            };
            responses: {
                /** @description No Content */
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Too Many Requests */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/nutritionists/me/patients": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lista los pacientes activos asignados al nutricionista autenticado. */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["AssignedPatientSummary"][];
                        "application/json": components["schemas"]["AssignedPatientSummary"][];
                        "text/json": components["schemas"]["AssignedPatientSummary"][];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/nutritionists/me/patients/{patientUserId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Devuelve el detalle clínico de un paciente asignado. Requiere una asignación
         *     activa con el paciente; de lo contrario responde 403. Si el paciente todavía no completó
         *     su perfil, responde 200 con `onboardingCompleted: false` y los campos clínicos en null
         *     (acta A69).
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Identificador de la cuenta del paciente. */
                    patientUserId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["GetAssignedPatientDetailResult"];
                        "application/json": components["schemas"]["GetAssignedPatientDetailResult"];
                        "text/json": components["schemas"]["GetAssignedPatientDetailResult"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/nutritionists/me/patients/{patientId}/evolution": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Devuelve las métricas de evolución clínica de un paciente asignado (US21): serie
         *     IBS-SSS, variación respecto de la línea base, respuesta clínica significativa y
         *     frecuencia de registro reciente. Requiere una asignación activa; de lo contrario 403.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Identificador de la cuenta del paciente. */
                    patientId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["PatientEvolutionForNutritionistResult"];
                        "application/json": components["schemas"]["PatientEvolutionForNutritionistResult"];
                        "text/json": components["schemas"]["PatientEvolutionForNutritionistResult"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/symptoms/{id}/meal-association": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Corrige a mano la comida asociada a un síntoma de un paciente asignado: con `mealId` la fija a
         *     esa comida, sin sujeción a la ventana de 4 horas; con `mealId: null` la desvincula. La comida
         *     debe ser del mismo paciente. Requiere el header `Idempotency-Key`.
         */
        put: {
            parameters: {
                query?: never;
                header?: {
                    /** @description Clave de idempotencia del header `Idempotency-Key`. */
                    "Idempotency-Key"?: string;
                };
                path: {
                    /** @description Identificador del síntoma. */
                    id: string;
                };
                cookie?: never;
            };
            /** @description Comida que se asocia, o null para desvincular. */
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["SetSymptomMealAssociationRequest"];
                    "text/json": components["schemas"]["SetSymptomMealAssociationRequest"];
                    "application/*+json": components["schemas"]["SetSymptomMealAssociationRequest"];
                };
            };
            responses: {
                /** @description No Content */
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Too Many Requests */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/recommendations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Solicita la generación de una nueva recomendación para el paciente autenticado. Requiere el
         *     header `Idempotency-Key`.
         */
        post: {
            parameters: {
                query?: never;
                header?: {
                    /** @description Clave de idempotencia (UUID v4) del header `Idempotency-Key`. */
                    "Idempotency-Key"?: string;
                };
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["GenerateRecommendationResult"];
                        "application/json": components["schemas"]["GenerateRecommendationResult"];
                        "text/json": components["schemas"]["GenerateRecommendationResult"];
                    };
                };
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["GenerateRecommendationResult"];
                        "application/json": components["schemas"]["GenerateRecommendationResult"];
                        "text/json": components["schemas"]["GenerateRecommendationResult"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unprocessable Content */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Too Many Requests */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/recommendations/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lista, paginadas, las recomendaciones del paciente autenticado. */
        get: {
            parameters: {
                query?: {
                    /** @description Estado por el que filtrar, o null para todos. */
                    status?: components["schemas"]["RecommendationStatus"];
                    /** @description Número de página. */
                    page?: number;
                    /** @description Tamaño de página. */
                    pageSize?: number;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["RecommendationSummaryDtoPagedResult"];
                        "application/json": components["schemas"]["RecommendationSummaryDtoPagedResult"];
                        "text/json": components["schemas"]["RecommendationSummaryDtoPagedResult"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Too Many Requests */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/recommendations/{id}/deliver": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Marca una recomendación como entregada cuando el paciente la visualiza. Requiere el header
         *     `Idempotency-Key`.
         */
        post: {
            parameters: {
                query?: never;
                header?: {
                    /** @description Clave de idempotencia del header `Idempotency-Key`. */
                    "Idempotency-Key"?: string;
                };
                path: {
                    /** @description Identificador de la recomendación. */
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description No Content */
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Too Many Requests */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/recommendations/{id}/feedback": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Envía la retroalimentación del paciente sobre una recomendación entregada. Requiere el header
         *     `Idempotency-Key`.
         */
        post: {
            parameters: {
                query?: never;
                header?: {
                    /** @description Clave de idempotencia del header `Idempotency-Key`. */
                    "Idempotency-Key"?: string;
                };
                path: {
                    /** @description Identificador de la recomendación. */
                    id: string;
                };
                cookie?: never;
            };
            /** @description Datos de la retroalimentación. */
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["SubmitFeedbackRequest"];
                    "text/json": components["schemas"]["SubmitFeedbackRequest"];
                    "application/*+json": components["schemas"]["SubmitFeedbackRequest"];
                };
            };
            responses: {
                /** @description No Content */
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Too Many Requests */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/patients/profile": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Devuelve el perfil clínico completo del paciente autenticado. */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["GetPatientProfileResult"];
                        "application/json": components["schemas"]["GetPatientProfileResult"];
                        "text/json": components["schemas"]["GetPatientProfileResult"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        /** Actualiza campos modificables del perfil clínico del paciente autenticado. */
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Campos a actualizar. */
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["UpdatePatientProfileRequest"];
                    "text/json": components["schemas"]["UpdatePatientProfileRequest"];
                    "application/*+json": components["schemas"]["UpdatePatientProfileRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["UpdatePatientProfileResult"];
                        "application/json": components["schemas"]["UpdatePatientProfileResult"];
                        "text/json": components["schemas"]["UpdatePatientProfileResult"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        /** Crea el perfil clínico del paciente autenticado. */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Datos del perfil. */
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["CreatePatientProfileRequest"];
                    "text/json": components["schemas"]["CreatePatientProfileRequest"];
                    "application/*+json": components["schemas"]["CreatePatientProfileRequest"];
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CreatePatientProfileResult"];
                        "application/json": components["schemas"]["CreatePatientProfileResult"];
                        "text/json": components["schemas"]["CreatePatientProfileResult"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/patients/allergies": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lista las alergias declaradas por el paciente autenticado. */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["PatientAllergySummary"][];
                        "application/json": components["schemas"]["PatientAllergySummary"][];
                        "text/json": components["schemas"]["PatientAllergySummary"][];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        /** Declara una alergia para el paciente autenticado. */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Datos de la alergia. */
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["DeclareAllergyRequest"];
                    "text/json": components["schemas"]["DeclareAllergyRequest"];
                    "application/*+json": components["schemas"]["DeclareAllergyRequest"];
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["DeclarePatientAllergyResult"];
                        "application/json": components["schemas"]["DeclarePatientAllergyResult"];
                        "text/json": components["schemas"]["DeclarePatientAllergyResult"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/patients/allergies/{patientAllergyId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Elimina una declaración de alergia del paciente autenticado. */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Identificador de la declaración. */
                    patientAllergyId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description No Content */
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/patients/me/export-data": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Exporta todos los datos personales y clínicos del paciente autenticado en un archivo ZIP de CSVs
         *     (US25, derecho a la portabilidad de datos, Ley N° 29733) y devuelve una URL de descarga prefirmada.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ExportMyDataResult"];
                        "application/json": components["schemas"]["ExportMyDataResult"];
                        "text/json": components["schemas"]["ExportMyDataResult"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/patients/me/consent": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Devuelve los datos del consentimiento informado aceptado por el paciente autenticado
         *     (HU0001 escenario 4): versión, momento de aceptación y hash del texto.
         * @description Complementa a `me/consent/pdf`. La sección de privacidad necesita mostrar versión y
         *     fecha sin obligar al paciente a descargar el documento binario para verlas.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["MyConsentResult"];
                        "application/json": components["schemas"]["MyConsentResult"];
                        "text/json": components["schemas"]["MyConsentResult"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/patients/me/consent/pdf": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Descarga el comprobante en PDF del consentimiento informado aceptado por el paciente autenticado
         *     (US01 CA04). El PDF no está cifrado: es un dato propio del paciente.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/pdf": string;
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/pdf": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/pdf": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/pdf": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/pdf": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/patients/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Elimina (anonimiza) la cuenta del paciente autenticado en ejercicio del derecho al olvido
         *     (US26, Ley N° 29733). No es un borrado físico: los datos personales se anonimizan y la cuenta se
         *     deshabilita en el proveedor de identidad.
         */
        delete: {
            parameters: {
                query?: {
                    /**
                     * @description Acuse de la retención normativa cuando la cuenta está inscrita en un piloto clínico activo. Si
                     *     la cuenta está en el piloto y este valor es false, la operación devuelve 409.
                     */
                    confirmedActivePilotAcknowledged?: boolean;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description No Content */
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/patients/me/summary": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Devuelve el perfil agregado del paciente autenticado (US28): identificación, perfil clínico,
         *     fecha de inicio en el piloto, nutricionista asignado y evolución IBS-SSS resumida.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["MyProfileSummaryResult"];
                        "application/json": components["schemas"]["MyProfileSummaryResult"];
                        "text/json": components["schemas"]["MyProfileSummaryResult"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/patients/me/report": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Genera el reporte clínico personal del paciente autenticado (US24). Devuelve una URL prefirmada
         *     de descarga; la contraseña del PDF cifrado se envía por correo en un mensaje separado. Responde
         *     422 si el paciente no tiene datos en el período.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /**
             * @description Período a cubrir (HU0024 CA01). Es opcional: sin cuerpo, el reporte abarca los últimos 90 días.
             *     Si se envía, deben ir los dos extremos, con inicio anterior al fin, fin no futuro y una
             *     duración de hasta 90 días.
             */
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["GenerateMyClinicalReportRequest"];
                    "text/json": components["schemas"]["GenerateMyClinicalReportRequest"];
                    "application/*+json": components["schemas"]["GenerateMyClinicalReportRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["GenerateMyClinicalReportResult"];
                        "application/json": components["schemas"]["GenerateMyClinicalReportResult"];
                        "text/json": components["schemas"]["GenerateMyClinicalReportResult"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unprocessable Content */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/patients/me/nutritionist-assignment": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Canjea un código de invitación para vincular al paciente autenticado con un nutricionista
         *     (US20 CA02, acta A41). Está pensado para quienes se registraron sin código y no tenían forma de
         *     vincularse después.
         * @description El 409 `nutritionist_not_available` incluye la extensión `reason` con el estado exacto
         *     de la cuenta del nutricionista: `pending_activation`, `inactive` o `suspended`.
         *     En ese caso el código <b>no</b> se consume.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Código de invitación a canjear. */
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["AssignNutritionistRequest"];
                    "text/json": components["schemas"]["AssignNutritionistRequest"];
                    "application/*+json": components["schemas"]["AssignNutritionistRequest"];
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["AssignNutritionistResult"];
                        "application/json": components["schemas"]["AssignNutritionistResult"];
                        "text/json": components["schemas"]["AssignNutritionistResult"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/portal/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Inicia sesión en el portal. Devuelve el access token en el cuerpo y deja el refresh token en la
         *     cookie `cauce_portal_rt`. Un paciente, una cuenta deshabilitada, pendiente de activación,
         *     suspendida o inactiva, y una contraseña incorrecta reciben el mismo 401 `invalid_credentials`;
         *     la causa queda solo en la auditoría. La cuenta bloqueada por intentos fallidos recibe 423
         *     `account_locked` con `lockedUntil`.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Credenciales del nutricionista. */
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["PortalLoginRequest"];
                    "text/json": components["schemas"]["PortalLoginRequest"];
                    "application/*+json": components["schemas"]["PortalLoginRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["PortalSessionResult"];
                        "application/json": components["schemas"]["PortalSessionResult"];
                        "text/json": components["schemas"]["PortalSessionResult"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Locked */
                423: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Too Many Requests */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/portal/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Renueva la sesión del portal con el refresh token de la cookie. Exige el header
         *     `X-Cauce-Portal`. Rota la cookie y devuelve un access token nuevo. Sin cookie, o con un token
         *     vencido, revocado o de un nutricionista que ya no puede usar el portal, responde 401
         *     `invalid_refresh_token`: el portal debe volver al login.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["PortalSessionResult"];
                        "application/json": components["schemas"]["PortalSessionResult"];
                        "text/json": components["schemas"]["PortalSessionResult"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Too Many Requests */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/portal/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Cierra la sesión del portal: revoca en Keycloak el refresh token de la cookie y la borra. Exige el
         *     access token del nutricionista y el header `X-Cauce-Portal`. Sin cookie, igual responde 204.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description No Content */
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/recommendations/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Devuelve el detalle de una recomendación. */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Identificador de la recomendación. */
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["RecommendationDetailDto"];
                        "application/json": components["schemas"]["RecommendationDetailDto"];
                        "text/json": components["schemas"]["RecommendationDetailDto"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Too Many Requests */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/reports/patients/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Genera el reporte clínico de un paciente en el período indicado. Requiere el header
         *     `Idempotency-Key` (UUID v4).
         */
        post: {
            parameters: {
                query?: never;
                header?: {
                    /** @description Clave de idempotencia del header `Idempotency-Key`. */
                    "Idempotency-Key"?: string;
                };
                path: {
                    /** @description Identificador del paciente. */
                    id: string;
                };
                cookie?: never;
            };
            /** @description Período del reporte. */
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["GenerateClinicalReportRequest"];
                    "text/json": components["schemas"]["GenerateClinicalReportRequest"];
                    "application/*+json": components["schemas"]["GenerateClinicalReportRequest"];
                };
            };
            responses: {
                /** @description Accepted */
                202: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["GenerateClinicalReportResult"];
                        "application/json": components["schemas"]["GenerateClinicalReportResult"];
                        "text/json": components["schemas"]["GenerateClinicalReportResult"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unprocessable Content */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Too Many Requests */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/symptoms": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Devuelve el historial paginado de síntomas del paciente autenticado. */
        get: {
            parameters: {
                query: {
                    /** @description Inicio del rango, obligatorio e inclusivo, sobre `clientCreatedAt`. Debe llevar zona horaria (`Z` u offset, como `2026-10-01T00:00:00-05:00`). */
                    from: string;
                    /** @description Fin del rango, obligatorio e inclusivo, sobre `clientCreatedAt`. Debe llevar zona horaria y no ser anterior a `from`. */
                    to: string;
                    /** @description Número de página. */
                    page?: number;
                    /** @description Tamaño de página. */
                    pageSize?: number;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["SymptomHistoryItemPagedResult"];
                        "application/json": components["schemas"]["SymptomHistoryItemPagedResult"];
                        "text/json": components["schemas"]["SymptomHistoryItemPagedResult"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Too Many Requests */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        /**
         * Registra un síntoma del paciente autenticado. El servidor calcula la asociación con
         *     la comida más reciente dentro de la ventana de 4 horas. Es idempotente respecto del
         *     `client_guid`.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Datos del síntoma. */
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["CreateSymptomRequest"];
                    "text/json": components["schemas"]["CreateSymptomRequest"];
                    "application/*+json": components["schemas"]["CreateSymptomRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CreateSymptomResult"];
                        "application/json": components["schemas"]["CreateSymptomResult"];
                        "text/json": components["schemas"]["CreateSymptomResult"];
                    };
                };
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CreateSymptomResult"];
                        "application/json": components["schemas"]["CreateSymptomResult"];
                        "text/json": components["schemas"]["CreateSymptomResult"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Too Many Requests */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/sync/batch": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Sincroniza un lote de comidas y síntomas. Devuelve 200 con la clasificación de cada
         *     elemento en aceptados, duplicados y errores.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Lote de comidas y síntomas. */
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["SyncBatchRequest"];
                    "text/json": components["schemas"]["SyncBatchRequest"];
                    "application/*+json": components["schemas"]["SyncBatchRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["SyncBatchResult"];
                        "application/json": components["schemas"]["SyncBatchResult"];
                        "text/json": components["schemas"]["SyncBatchResult"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Too Many Requests */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/users/me/fcm-token": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Registra o actualiza el token de notificaciones push (Firebase Cloud Messaging) del dispositivo
         *     del usuario autenticado (TS10 CA01). Enviar `null` desvincula el token.
         */
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Cuerpo con el token de FCM. */
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["UpdateFcmTokenRequest"];
                    "text/json": components["schemas"]["UpdateFcmTokenRequest"];
                    "application/*+json": components["schemas"]["UpdateFcmTokenRequest"];
                };
            };
            responses: {
                /** @description No Content */
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /** @enum {string} */
        ActionType: "Suggest" | "Reduce" | "Avoid" | "Substitute";
        AllergyCatalogItem: {
            /** Format: uuid */
            allergyId: string;
            name: string | null;
            allergyType: components["schemas"]["AllergyType"];
            description: string | null;
        };
        /** @enum {string} */
        AllergySeverity: "Mild" | "Moderate" | "Severe";
        /** @enum {string} */
        AllergyType: "Allergy" | "Intolerance" | "Sensitivity";
        /** @description Cuerpo de la petición para aprobar una recomendación. */
        ApproveRecommendationRequest: {
            /** @description Nota clínica de aprobación (entre 20 y 2000 caracteres, US17 CA01). */
            note: string | null;
        };
        /** @enum {string} */
        ArchiveReason: "TemporalExpiration" | "ManualSubstitution" | "ObjectiveMet" | "PlanChange";
        /** @description Cuerpo de la petición de archivado de una recomendación (US30 CA01). */
        ArchiveRecommendationRequest: {
            reason: components["schemas"]["ArchiveReason"];
        };
        /** @enum {string} */
        AssessmentType: "Baseline" | "Periodic";
        /**
         * @description Cuerpo de la petición de canje de un código de invitación después del registro (acta A41). Permite a
         *     un paciente que se registró sin código vincularse a un nutricionista más adelante.
         */
        AssignNutritionistRequest: {
            /**
             * @description Código de invitación emitido por el nutricionista. Se normaliza a mayúsculas sin espacios
             *     envolventes antes de validarse.
             */
            invitationCode: string | null;
        };
        AssignNutritionistResult: {
            /** Format: uuid */
            nutritionistId: string;
            nutritionistFullName: string | null;
            /** Format: date-time */
            assignedAt: string;
        };
        AssignedPatientSummary: {
            /** Format: uuid */
            patientUserId: string;
            patientFullName: string | null;
            /** Format: uuid */
            assignmentId: string;
            /** Format: date-time */
            assignedAt: string;
            profileCompleted: boolean;
            ibsSubtype: components["schemas"]["IbsSubtype"];
            /** Format: int32 */
            latestIbsSssScore: number | null;
            /** Format: date-time */
            lastActivityAt: string | null;
            /** Format: int32 */
            pendingReviewOver24hCount: number;
            priorityLevel: components["schemas"]["PriorityLevel"];
        };
        AuthenticatedUser: {
            /** Format: uuid */
            userId: string;
            keycloakId: string | null;
            email: string | null;
            role: string | null;
            fullName: string | null;
            emailVerified: boolean;
            isInActivePilot: boolean;
        };
        /** @enum {string} */
        BiologicalSex: "Male" | "Female" | "Other";
        ClinicalNoteHistoryEvent: Omit<components["schemas"]["HistoryEvent"], "eventType"> & {
            note?: components["schemas"]["ClinicalNoteSummary"];
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            eventType: "clinical_note";
        };
        ClinicalNoteSummary: {
            /** Format: uuid */
            noteId: string;
            /** Format: uuid */
            clientGuid: string;
            /** Format: uuid */
            mealId: string | null;
            /** Format: uuid */
            symptomId: string | null;
            content: string | null;
            /** Format: date-time */
            createdAt: string;
        };
        /** @description Cuerpo de la petición de confirmación de restablecimiento de contraseña. */
        ConfirmPasswordResetRequest: {
            /** @description Token de restablecimiento recibido por correo. */
            token: string | null;
            /** @description Nueva contraseña elegida por el usuario. */
            newPassword: string | null;
        };
        /**
         * @description Cuerpo de la petición de creación de una nota clínica, asociada exactamente a una
         *     comida o a un síntoma.
         */
        CreateClinicalNoteRequest: {
            /**
             * Format: uuid
             * @description Identificador de la comida asociada, o null.
             */
            mealId: string | null;
            /**
             * Format: uuid
             * @description Identificador del síntoma asociado, o null.
             */
            symptomId: string | null;
            /** @description Contenido de la nota (1–500 caracteres). */
            content: string | null;
            /**
             * Format: uuid
             * @description Identificador generado en el dispositivo que da idempotencia al alta. Puede omitirse en el cuerpo
             *     y enviarse en el encabezado `Idempotency-Key`; si viajan ambos, deben coincidir.
             */
            clientGuid: string | null;
        };
        CreateClinicalNoteResult: {
            /** Format: uuid */
            noteId: string;
        };
        /** @description Cuerpo de la petición de creación de un alimento personalizado. */
        CreateCustomFoodRequest: {
            /** @description Nombre del alimento personalizado. */
            name: string | null;
            /**
             * Format: double
             * @description Tamaño de porción en gramos.
             */
            portionSizeGrams: number;
            /** @description Ingredientes del alimento personalizado. */
            ingredients: components["schemas"]["CustomFoodIngredientRequest"][] | null;
            /**
             * @description Confirma la creación pese a coincidencias con alergias declaradas (US10 CA03). Por defecto
             *     false: si hay coincidencias sin confirmar, la respuesta es 409 con el detalle.
             */
            confirmedAllergens: boolean;
        };
        CreateCustomFoodResult: {
            /** Format: uuid */
            customFoodId: string;
        };
        /**
         * @description Cuerpo de la petición de registro de una evaluación IBS-SSS. El cliente envía
         *     únicamente las cinco dimensiones; el servidor calcula el puntaje total y la categoría.
         */
        CreateIbsSssAssessmentRequest: {
            assessmentType: components["schemas"]["AssessmentType"];
            /**
             * Format: int32
             * @description Severidad del dolor (0–100).
             */
            painSeverity: number;
            /**
             * Format: int32
             * @description Frecuencia del dolor (0–100).
             */
            painFrequency: number;
            /**
             * Format: int32
             * @description Severidad de la distensión (0–100).
             */
            bloatingSeverity: number;
            /**
             * Format: int32
             * @description Insatisfacción con el hábito intestinal (0–100).
             */
            bowelHabitsDissatisfaction: number;
            /**
             * Format: int32
             * @description Interferencia con la vida diaria (0–100).
             */
            lifeInterference: number;
        };
        CreateIbsSssAssessmentResult: {
            /** Format: uuid */
            assessmentId: string;
            /** Format: int32 */
            totalScore: number;
            severityCategory: components["schemas"]["SeverityCategory"];
            /** Format: date */
            nextAssessmentDate: string | null;
            triggeredOnboardingCompletion: boolean;
        };
        /** @description Cuerpo de la petición de creación manual de una recomendación (US29). */
        CreateManualRecommendationRequest: {
            /**
             * Format: uuid
             * @description Identificador del paciente destinatario.
             */
            patientId: string;
            /** @description Título de la recomendación. */
            title: string | null;
            /** @description Descripción de la recomendación. */
            description: string | null;
            /** @description Pasos accionables, opcional. */
            steps: string[] | null;
            /** @description Nota clínica del nutricionista (entre 10 y 2000 caracteres, US29). */
            clinicalNote: string | null;
            /**
             * Format: date-time
             * @description Fecha de vigencia, o null si no caduca.
             */
            validUntil: string | null;
        };
        CreateManualRecommendationResult: {
            /** Format: uuid */
            recommendationId: string;
            status: components["schemas"]["RecommendationStatus"];
        };
        /**
         * @description Cuerpo de la petición de registro de una comida. El Cauce.Api.Contracts.ClinicalRegistry.CreateMealRequest.ClientGuid puede
         *     omitirse en el cuerpo y enviarse en el encabezado `Idempotency-Key`.
         */
        CreateMealRequest: {
            /**
             * Format: uuid
             * @description Identificador del dispositivo (UUID v4), opcional si viaja en el encabezado.
             */
            clientGuid: string | null;
            mealTime: components["schemas"]["MealTime"];
            /**
             * Format: date-time
             * @description Momento de consumo.
             */
            consumedAt: string;
            /**
             * Format: date-time
             * @description Momento de creación en el dispositivo.
             */
            clientCreatedAt: string;
            /** @description Ítems de la comida. */
            items: components["schemas"]["MealItemRequest"][] | null;
        };
        CreateMealResult: {
            /** Format: uuid */
            mealId: string;
            aggregatedFodmap: components["schemas"]["FodmapLevel"];
        };
        /** @description Cuerpo de la petición de provisión de un nutricionista. */
        CreateNutritionistRequest: {
            /** @description Correo electrónico del nutricionista. */
            email: string | null;
            /** @description Nombre completo del nutricionista. */
            fullName: string | null;
        };
        CreateNutritionistResult: {
            /** Format: uuid */
            userId: string;
            email: string | null;
            status: components["schemas"]["UserStatus"];
            activationEmailSent: boolean;
        };
        /** @description Cuerpo de la petición de creación del perfil clínico del paciente. */
        CreatePatientProfileRequest: {
            /**
             * Format: date
             * @description Fecha de nacimiento.
             */
            dateOfBirth: string;
            biologicalSex: components["schemas"]["BiologicalSex"];
            /**
             * Format: double
             * @description Peso en kilogramos.
             */
            weightKg: number;
            /**
             * Format: double
             * @description Estatura en centímetros.
             */
            heightCm: number;
            ibsSubtype: components["schemas"]["IbsSubtype"];
            /**
             * Format: date
             * @description Fecha de diagnóstico, opcional.
             */
            diagnosisDate: string | null;
            /** @description Medicación actual, opcional. */
            medications: string | null;
        };
        CreatePatientProfileResult: {
            /** Format: uuid */
            profileId: string;
            /** Format: double */
            bmi: number;
            bmiCategory: string | null;
            /** Format: int32 */
            age: number;
            nutritionistAssigned: boolean;
            /** Format: uuid */
            nutritionistAssignmentId: string | null;
        };
        /**
         * @description Cuerpo de la petición de registro de un síntoma. El Cauce.Api.Contracts.ClinicalRegistry.CreateSymptomRequest.ClientGuid puede
         *     omitirse en el cuerpo y enviarse en el encabezado `Idempotency-Key`.
         */
        CreateSymptomRequest: {
            /**
             * Format: uuid
             * @description Identificador del dispositivo (UUID v4), opcional si viaja en el encabezado.
             */
            clientGuid: string | null;
            symptomType: components["schemas"]["SymptomType"];
            /**
             * Format: int32
             * @description Intensidad (1–100).
             */
            intensity: number;
            /**
             * Format: date-time
             * @description Momento de ocurrencia.
             */
            occurredAt: string;
            /**
             * Format: date-time
             * @description Momento de creación en el dispositivo.
             */
            clientCreatedAt: string;
        };
        CreateSymptomResult: {
            /** Format: uuid */
            symptomId: string;
            /** Format: uuid */
            associatedMealId: string | null;
            hasMealAssociation: boolean;
        };
        CurrentConsentResult: {
            version: string | null;
            text: string | null;
            hash: string | null;
        };
        CustomFoodIngredientRequest: {
            /** Format: uuid */
            foodId: string;
            /** Format: double */
            proportionGrams: number;
        };
        CustomFoodIngredientSummary: {
            /** Format: uuid */
            foodId: string;
            /** Format: double */
            proportionGrams: number;
        };
        CustomFoodSummary: {
            /** Format: uuid */
            customFoodId: string;
            name: string | null;
            /** Format: double */
            portionSizeGrams: number;
            /** Format: date-time */
            createdAt: string;
            ingredients: components["schemas"]["CustomFoodIngredientSummary"][] | null;
        };
        /** @description Cuerpo de la petición para declarar una alergia del paciente. */
        DeclareAllergyRequest: {
            /**
             * Format: uuid
             * @description Identificador de la alergia del catálogo.
             */
            allergyId: string;
            severity: components["schemas"]["AllergySeverity"];
            /** @description Notas opcionales. */
            notes: string | null;
        };
        DeclarePatientAllergyResult: {
            /** Format: uuid */
            patientAllergyId: string;
        };
        /** @enum {string} */
        ExplanationSource: "LlmGenerated" | "Fallback" | "Manual";
        ExportMyDataResult: {
            downloadUrl: string | null;
            /** Format: date-time */
            expiresAtUtc: string;
        };
        /** @enum {string} */
        FeedbackOutcome: "Improvement" | "NoChange" | "Worsening";
        /** @enum {string} */
        FodmapLevel: "Low" | "Moderate" | "High";
        FoodItemDetail: {
            /** Format: uuid */
            foodId: string;
            name: string | null;
            category: string | null;
            /** Format: double */
            caloriesPer100g: number;
            /** Format: double */
            proteinGPer100g: number;
            /** Format: double */
            carbsGPer100g: number;
            /** Format: double */
            fatGPer100g: number;
            /** Format: double */
            fiberGPer100g: number;
            fodmapLevel: components["schemas"]["FodmapLevel"];
            fodmapTags: string | null;
            isPeruvian: boolean;
            isActive: boolean;
        };
        FoodItemSummary: {
            /** Format: uuid */
            foodId: string;
            name: string | null;
            category: string | null;
            fodmapLevel: components["schemas"]["FodmapLevel"];
            isPeruvian: boolean;
        };
        FoodItemSummaryPagedResult: {
            items: components["schemas"]["FoodItemSummary"][] | null;
            /** Format: int32 */
            page: number;
            /** Format: int32 */
            pageSize: number;
            /** Format: int32 */
            totalCount: number;
        };
        FoodSuggestionsResult: {
            frequentLast30Days: components["schemas"]["FoodItemSummary"][] | null;
            recentLast24Hours: components["schemas"]["FoodItemSummary"][] | null;
            catalogSuggestions: components["schemas"]["FoodItemSummary"][] | null;
        };
        /** @description Solicitud de generación de un reporte clínico para un paciente en un período. */
        GenerateClinicalReportRequest: {
            /**
             * Format: date
             * @description Inicio del período.
             */
            periodStart: string;
            /**
             * Format: date
             * @description Fin del período.
             */
            periodEnd: string;
        };
        GenerateClinicalReportResult: {
            /** Format: uuid */
            reportId: string;
            presignedUrl: string | null;
            /** Format: date-time */
            presignedUrlExpiresAt: string;
        };
        GenerateInvitationCodeResult: {
            code: string | null;
            /** Format: date-time */
            expiresAt: string;
        };
        /**
         * @description Cuerpo opcional de la solicitud del autoreporte clínico del paciente (US24). Si se omite el
         *     cuerpo, o si ambos extremos llegan en null, el reporte cubre la ventana por
         *     defecto de 90 días hacia atrás.
         */
        GenerateMyClinicalReportRequest: {
            /**
             * Format: date
             * @description Inicio del período, o null.
             */
            periodStart: string | null;
            /**
             * Format: date
             * @description Fin del período, o null.
             */
            periodEnd: string | null;
        };
        GenerateMyClinicalReportResult: {
            /** Format: uuid */
            reportId: string;
            presignedUrl: string | null;
            /** Format: date-time */
            presignedUrlExpiresAt: string;
        };
        GenerateRecommendationResult: {
            /** Format: uuid */
            recommendationId: string;
            status: components["schemas"]["RecommendationStatus"];
            requiresReview: boolean;
            /** Format: date-time */
            generatedAt: string;
            /** Format: date-time */
            expiresAt: string | null;
        };
        GetAssignedPatientDetailResult: {
            /** Format: uuid */
            patientUserId: string;
            fullName: string | null;
            /** Format: int32 */
            age: number | null;
            /** Format: double */
            bmi: number | null;
            bmiCategory: string | null;
            ibsSubtype: components["schemas"]["IbsSubtype"];
            onboardingCompleted: boolean;
            allergies: components["schemas"]["PatientAllergySummary"][] | null;
            biologicalSex: components["schemas"]["BiologicalSex"];
            /** Format: date */
            diagnosisDate: string | null;
            medications: string | null;
        };
        GetNutritionistResult: {
            /** Format: uuid */
            userId: string;
            email: string | null;
            fullName: string | null;
            status: components["schemas"]["UserStatus"];
        };
        GetPatientProfileResult: {
            /** Format: uuid */
            profileId: string;
            /** Format: uuid */
            userId: string;
            /** Format: date */
            dateOfBirth: string;
            biologicalSex: components["schemas"]["BiologicalSex"];
            /** Format: double */
            weightKg: number;
            /** Format: double */
            heightCm: number;
            /** Format: double */
            bmi: number;
            bmiCategory: string | null;
            /** Format: int32 */
            age: number;
            ibsSubtype: components["schemas"]["IbsSubtype"];
            /** Format: date */
            diagnosisDate: string | null;
            medications: string | null;
            onboardingCompleted: boolean;
            allergies: components["schemas"]["PatientAllergySummary"][] | null;
            assignedNutritionist: components["schemas"]["NutritionistAssignmentSummary"];
        };
        /** @enum {string} */
        GlossaryCategory: "Nutritional" | "ClinicalIbs" | "System";
        GlossaryResult: {
            terms: components["schemas"]["GlossaryTermDto"][] | null;
            contentStatus: string | null;
        };
        GlossaryTermDto: {
            term: string | null;
            definition: string | null;
            category: components["schemas"]["GlossaryCategory"];
        };
        HistoryEvent: {
            eventType: string;
            /** Format: date-time */
            occurredAt?: string;
        };
        IbsSssAssessmentSummary: {
            /** Format: uuid */
            assessmentId: string;
            assessmentType: components["schemas"]["AssessmentType"];
            /** Format: int32 */
            cycleNumber: number;
            /** Format: int32 */
            painSeverity: number;
            /** Format: int32 */
            painFrequency: number;
            /** Format: int32 */
            bloatingSeverity: number;
            /** Format: int32 */
            bowelHabitsDissatisfaction: number;
            /** Format: int32 */
            lifeInterference: number;
            /** Format: int32 */
            totalScore: number;
            severityCategory: components["schemas"]["SeverityCategory"];
            /** Format: date-time */
            completedAt: string;
            /** Format: date */
            nextAssessmentDate: string | null;
        };
        IbsSssEvolutionEntry: {
            assessment: components["schemas"]["IbsSssAssessmentSummary"];
            /** Format: int32 */
            deltaFromBaseline: number | null;
        };
        /** @enum {string} */
        IbsSubtype: "IbsD" | "IbsC" | "IbsM" | "IbsU";
        /** @description Solicitud de inicio de sesión. El backend hace passthrough a Keycloak con estas credenciales. */
        LoginRequest: {
            /** @description Correo electrónico del usuario. */
            email: string | null;
            /** @description Contraseña. */
            password: string | null;
            /** @description Identificador del cliente OIDC (por ejemplo, `cauce-mobile` o `cauce-web-portal`). */
            clientId: string | null;
        };
        LoginResult: {
            accessToken: string | null;
            refreshToken: string | null;
            /** Format: int32 */
            expiresIn: number;
            /** Format: int32 */
            refreshExpiresIn: number;
            tokenType: string | null;
            user: components["schemas"]["AuthenticatedUser"];
        };
        /** @description Solicitud de cierre de sesión. El backend revoca el refresh token en Keycloak. */
        LogoutRequest: {
            /** @description Refresh token a revocar. */
            refreshToken: string | null;
            /** @description Identificador del cliente OIDC. */
            clientId: string | null;
        };
        MealBatchItem: {
            /** Format: uuid */
            clientGuid: string;
            mealTime: components["schemas"]["MealTime"];
            /** Format: date-time */
            consumedAt: string;
            /** Format: date-time */
            clientCreatedAt: string;
            items: components["schemas"]["MealItemRequest"][] | null;
        };
        MealHistoryEvent: Omit<components["schemas"]["HistoryEvent"], "eventType"> & {
            meal?: components["schemas"]["MealHistoryItem"];
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            eventType: "meal";
        };
        MealHistoryItem: {
            /** Format: uuid */
            mealId: string;
            /** Format: uuid */
            clientGuid: string;
            mealTime: components["schemas"]["MealTime"];
            /** Format: date-time */
            consumedAt: string;
            /** Format: date-time */
            clientCreatedAt: string;
            syncStatus: components["schemas"]["SyncStatus"];
            items: components["schemas"]["MealItemSummary"][] | null;
            aggregatedFodmap: components["schemas"]["FodmapLevel"];
        };
        MealHistoryItemPagedResult: {
            items: components["schemas"]["MealHistoryItem"][] | null;
            /** Format: int32 */
            page: number;
            /** Format: int32 */
            pageSize: number;
            /** Format: int32 */
            totalCount: number;
        };
        MealItemRequest: {
            /** Format: uuid */
            foodId: string | null;
            /** Format: uuid */
            customFoodId: string | null;
            /** Format: double */
            quantity: number;
            unit: components["schemas"]["MeasurementUnit"];
        };
        MealItemSummary: {
            /** Format: uuid */
            foodId: string | null;
            /** Format: uuid */
            customFoodId: string | null;
            /** Format: double */
            quantity: number;
            unit: components["schemas"]["MeasurementUnit"];
        };
        /** @enum {string} */
        MealTime: "Breakfast" | "Lunch" | "Dinner" | "Snack";
        /** @enum {string} */
        MeasurementUnit: "Grams" | "Cups" | "Units" | "Ounces" | "Tablespoons";
        ModifyRecommendationItemInput: {
            /** Format: uuid */
            foodId: string;
            actionType: components["schemas"]["ActionType"];
            reasoning: string | null;
            /** Format: uuid */
            substituteFoodId: string | null;
        };
        /** @description Cuerpo de la petición de aprobación con modificación de una recomendación (US17 CA03). */
        ModifyRecommendationRequest: {
            /** @description Nota clínica de la modificación (entre 10 y 2000 caracteres, US17 CA03). */
            clinicalNote: string | null;
            /** @description Nuevos ítems que reemplazan a los actuales, o null para conservarlos. */
            items: components["schemas"]["ModifyRecommendationItemInput"][] | null;
            /** @description Nuevo título, o null para conservarlo. */
            title: string | null;
            /** @description Nueva descripción, o null para conservarla. */
            description: string | null;
            /** @description Nuevos pasos, o null para conservarlos. */
            steps: string[] | null;
        };
        MyConsentResult: {
            documentVersion: string | null;
            /** Format: date-time */
            acceptedAt: string;
            consentTextHash: string | null;
            textAvailable: boolean;
        };
        MyProfileClinicalInfo: {
            ibsSubtype: components["schemas"]["IbsSubtype"];
            /** Format: date */
            diagnosisDate: string | null;
            /** Format: int32 */
            age: number;
            allergies: components["schemas"]["PatientAllergySummary"][] | null;
        };
        MyProfilePatientInfo: {
            patientCode: string | null;
            fullName: string | null;
            maskedEmail: string | null;
        };
        MyProfileSummaryResult: {
            patient: components["schemas"]["MyProfilePatientInfo"];
            clinical: components["schemas"]["MyProfileClinicalInfo"];
            /** Format: date */
            pilotStartDate: string;
            assignedNutritionist: components["schemas"]["NutritionistAssignmentSummary"];
            /** Format: int32 */
            ibsSssBaseline: number | null;
            /** Format: int32 */
            ibsSssLatest: number | null;
            /** Format: int32 */
            cumulativeChange: number | null;
            significantClinicalResponse: boolean;
        };
        NutritionistAssignmentSummary: {
            /** Format: uuid */
            assignmentId: string;
            /** Format: uuid */
            nutritionistUserId: string;
            nutritionistFullName: string | null;
            /** Format: date-time */
            assignedAt: string;
        };
        PatientAllergySummary: {
            /** Format: uuid */
            patientAllergyId: string;
            /** Format: uuid */
            allergyId: string;
            allergyName: string | null;
            allergyType: components["schemas"]["AllergyType"];
            severity: components["schemas"]["AllergySeverity"];
            notes: string | null;
            /** Format: date-time */
            declaredAt: string;
        };
        PatientEvolutionForNutritionistResult: {
            ibsSssTimeline: components["schemas"]["IbsSssEvolutionEntry"][] | null;
            /** Format: int32 */
            baselineScore: number | null;
            /** Format: int32 */
            latestScore: number | null;
            /** Format: double */
            percentChangeFromBaseline: number | null;
            significantClinicalResponse: boolean;
            /** Format: int32 */
            registrationFrequency14d: number;
        };
        PendingReviewRecommendationDto: {
            /** Format: uuid */
            recommendationId: string;
            /** Format: uuid */
            patientId: string;
            patientFullName: string | null;
            status: components["schemas"]["RecommendationStatus"];
            /** Format: double */
            confidenceScore: number;
            /** Format: int32 */
            itemsCount: number;
            /** Format: date-time */
            generatedAt: string;
            /** Format: date-time */
            expiresAt: string | null;
        };
        PendingReviewRecommendationDtoPagedResult: {
            items: components["schemas"]["PendingReviewRecommendationDto"][] | null;
            /** Format: int32 */
            page: number;
            /** Format: int32 */
            pageSize: number;
            /** Format: int32 */
            totalCount: number;
        };
        /**
         * @description Cuerpo de la petición de inicio de sesión del portal web. No lleva cliente OIDC: el canal lo define
         *     la ruta, y el backend usa siempre `cauce-web-portal` (acta A68).
         */
        PortalLoginRequest: {
            /** @description Correo electrónico. */
            email: string | null;
            /** @description Contraseña. */
            password: string | null;
        };
        /**
         * @description Respuesta del inicio de sesión y de la renovación del portal web. A diferencia de la del móvil, no
         *     trae el refresh token: viaja en la cookie `HttpOnly``cauce_portal_rt`, fuera del alcance del
         *     JavaScript del portal (acta A68). El portal guarda el access token solo en memoria.
         */
        PortalSessionResult: {
            /** @description Token de acceso JWT, para el header `Authorization: Bearer`. */
            accessToken: string | null;
            /**
             * Format: int32
             * @description Vigencia del token de acceso, en segundos.
             */
            expiresIn: number;
            /** @description Tipo de token, `Bearer`. */
            tokenType: string | null;
            user: components["schemas"]["AuthenticatedUser"];
        };
        /** @enum {string} */
        PriorityLevel: "None" | "Low" | "Medium" | "High";
        ProblemDetails: {
            type: string | null;
            title: string | null;
            /** Format: int32 */
            status: number | null;
            detail: string | null;
            instance: string | null;
        } & {
            [key: string]: unknown;
        };
        RecommendationDetailDto: {
            /** Format: uuid */
            recommendationId: string;
            /** Format: uuid */
            patientId: string;
            modelVersionName: string | null;
            status: components["schemas"]["RecommendationStatus"];
            /** Format: double */
            confidenceScore: number;
            autoApproved: boolean;
            /** Format: uuid */
            reviewedByNutritionistId: string | null;
            nutritionistNote: string | null;
            aiExplanation: string | null;
            explanationSource: components["schemas"]["ExplanationSource"];
            /** Format: date-time */
            generatedAt: string;
            /** Format: date-time */
            reviewedAt: string | null;
            /** Format: date-time */
            deliveredAt: string | null;
            /** Format: date-time */
            expiresAt: string | null;
            items: components["schemas"]["RecommendationItemDto"][] | null;
            feedback: components["schemas"]["RecommendationFeedbackDto"];
            reviewedByNutritionistName: string | null;
            steps: string[] | null;
            supportingData: components["schemas"]["RecommendationSupportingDataDto"];
            title: string | null;
            description: string | null;
            source: components["schemas"]["RecommendationSource"];
            isActive: boolean;
            /** Format: date-time */
            archivedAt: string | null;
            archiveReason: components["schemas"]["ArchiveReason"];
            /** Format: date-time */
            validUntil: string | null;
        };
        RecommendationFeedbackDto: {
            /** Format: uuid */
            feedbackId: string;
            wasApplied: boolean;
            outcome: components["schemas"]["FeedbackOutcome"];
            comment: string | null;
            /** Format: date-time */
            submittedAt: string;
        };
        RecommendationItemDto: {
            /** Format: uuid */
            recommendationItemId: string;
            /** Format: uuid */
            foodId: string;
            foodName: string | null;
            category: string | null;
            actionType: components["schemas"]["ActionType"];
            /** Format: uuid */
            substituteFoodId: string | null;
            substituteFoodName: string | null;
            reasoning: string | null;
        };
        /** @enum {string} */
        RecommendationSource: "EngineGenerated" | "Manual";
        /** @enum {string} */
        RecommendationStatus: "Generated" | "PendingReview" | "Approved" | "ModifiedApproved" | "ManualApproved" | "Rejected" | "Delivered" | "FeedbackReceived" | "Expired";
        RecommendationSummaryDto: {
            /** Format: uuid */
            recommendationId: string;
            status: components["schemas"]["RecommendationStatus"];
            /** Format: double */
            confidenceScore: number;
            /** Format: int32 */
            itemsCount: number;
            /** Format: date-time */
            generatedAt: string;
            /** Format: date-time */
            expiresAt: string | null;
        };
        RecommendationSummaryDtoPagedResult: {
            items: components["schemas"]["RecommendationSummaryDto"][] | null;
            /** Format: int32 */
            page: number;
            /** Format: int32 */
            pageSize: number;
            /** Format: int32 */
            totalCount: number;
        };
        RecommendationSupportingDataDto: {
            /** Format: int32 */
            symptomCountsLast14d: number;
            /** Format: int32 */
            mealCountsLast14d: number;
            topFodmapHighFoodsLast14d: string[] | null;
            /** Format: int32 */
            correlationWindowHours: number;
            /** Format: date-time */
            analysisWindowFrom: string;
            /** Format: date-time */
            analysisWindowTo: string;
        };
        /**
         * @description Cuerpo de la petición de renovación de sesión. El realm tiene rotación de refresh tokens
         *     activada, así que la respuesta trae un token nuevo y el enviado aquí queda revocado.
         */
        RefreshTokenRequest: {
            /** @description Refresh token vigente, obtenido del inicio de sesión o de una renovación previa. */
            refreshToken: string | null;
            /** @description Identificador del cliente OIDC (`cauce-mobile` o `cauce-web-portal`). */
            clientId: string | null;
        };
        /**
         * @description Cuerpo de la petición de registro de paciente. La dirección IP no se recibe del
         *     cliente: el backend la deriva del contexto de la conexión.
         */
        RegisterPatientRequest: {
            /** @description Correo electrónico del paciente. */
            email: string | null;
            /** @description Nombre completo del paciente. */
            fullName: string | null;
            /** @description Contraseña elegida por el paciente. */
            password: string | null;
            /** @description Versión del documento de consentimiento aceptado. */
            consentDocumentVersion: string | null;
            /** @description Hash SHA-256 (hex) del texto de consentimiento aceptado. */
            consentTextHash: string | null;
            /** @description Código de invitación opcional. */
            invitationCode: string | null;
        };
        RegisterPatientResult: {
            /** Format: uuid */
            userId: string;
            email: string | null;
            status: components["schemas"]["UserStatus"];
            emailVerificationRequired: boolean;
        };
        /** @description Cuerpo de la petición para rechazar una recomendación. */
        RejectRecommendationRequest: {
            /** @description Motivo del rechazo (entre 10 y 2000 caracteres). */
            reason: string | null;
        };
        /** @description Cuerpo de la petición de solicitud de restablecimiento de contraseña. */
        RequestPasswordResetRequest: {
            /** @description Correo electrónico de la cuenta. */
            email: string | null;
            /**
             * @description Identificador del cliente OIDC de origen (`cauce-mobile` o `cauce-web-portal`), que
             *     determina el destino del enlace enviado por correo. Es opcional por compatibilidad con los
             *     clientes que ya consumen este endpoint: si se omite, se asume `cauce-mobile`.
             */
            clientId: string | null;
        };
        /**
         * @description Cuerpo de la petición de reenvío del correo de verificación (acta A40). La respuesta es siempre 200
         *     cuando la petición supera la validación, exista o no la cuenta, para no revelar qué correos están
         *     registrados ni cuáles ya están verificados.
         */
        ResendVerificationEmailRequest: {
            /** @description Correo electrónico de la cuenta que solicita el reenvío. */
            email: string | null;
        };
        /** @description Cuerpo de la corrección manual de la comida asociada a un síntoma. */
        SetSymptomMealAssociationRequest: {
            /**
             * Format: uuid
             * @description Comida que se asocia al síntoma, o null para desvincularlo.
             */
            mealId: string | null;
        };
        /** @enum {string} */
        SeverityCategory: "Mild" | "Moderate" | "Severe";
        /** @description Cuerpo de la petición para enviar retroalimentación sobre una recomendación. */
        SubmitFeedbackRequest: {
            /** @description Indica si el paciente aplicó la recomendación. */
            wasApplied: boolean;
            outcome: components["schemas"]["FeedbackOutcome"];
            /** @description Comentario opcional (máximo 500 caracteres). */
            comment: string | null;
        };
        SymptomBatchItem: {
            /** Format: uuid */
            clientGuid: string;
            symptomType: components["schemas"]["SymptomType"];
            /** Format: int32 */
            intensity: number;
            /** Format: date-time */
            occurredAt: string;
            /** Format: date-time */
            clientCreatedAt: string;
        };
        SymptomHistoryEvent: Omit<components["schemas"]["HistoryEvent"], "eventType"> & {
            symptom?: components["schemas"]["SymptomHistoryItem"];
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            eventType: "symptom";
        };
        SymptomHistoryItem: {
            /** Format: uuid */
            symptomId: string;
            /** Format: uuid */
            clientGuid: string;
            symptomType: components["schemas"]["SymptomType"];
            /** Format: int32 */
            intensity: number;
            /** Format: date-time */
            occurredAt: string;
            /** Format: uuid */
            associatedMealId: string | null;
            hasMealAssociation: boolean;
            syncStatus: components["schemas"]["SyncStatus"];
        };
        SymptomHistoryItemPagedResult: {
            items: components["schemas"]["SymptomHistoryItem"][] | null;
            /** Format: int32 */
            page: number;
            /** Format: int32 */
            pageSize: number;
            /** Format: int32 */
            totalCount: number;
        };
        /** @enum {string} */
        SymptomType: "AbdominalPain" | "Bloating" | "Flatulence" | "Diarrhea" | "Constipation" | "Other" | "Nausea" | "Reflux" | "Urgency";
        SyncAcceptedEntry: {
            /** Format: uuid */
            clientGuid: string;
            /** Format: uuid */
            serverId: string;
            entityType: string | null;
        };
        /** @description Cuerpo de la petición de sincronización por lotes de comidas y síntomas. */
        SyncBatchRequest: {
            /** @description Comidas del lote. */
            meals: components["schemas"]["MealBatchItem"][] | null;
            /** @description Síntomas del lote. */
            symptoms: components["schemas"]["SymptomBatchItem"][] | null;
        };
        SyncBatchResult: {
            accepted: components["schemas"]["SyncAcceptedEntry"][] | null;
            duplicates: components["schemas"]["SyncDuplicateEntry"][] | null;
            errors: components["schemas"]["SyncErrorEntry"][] | null;
        };
        SyncDuplicateEntry: {
            /** Format: uuid */
            clientGuid: string;
            /** Format: uuid */
            existingServerId: string;
        };
        SyncErrorEntry: {
            /** Format: uuid */
            clientGuid: string;
            errorCode: string | null;
            message: string | null;
        };
        /** @enum {string} */
        SyncStatus: "SyncPending" | "SyncCompleted";
        /** @description Cuerpo de la petición de actualización de un alimento personalizado. */
        UpdateCustomFoodRequest: {
            /** @description Nuevo nombre del alimento personalizado. */
            name: string | null;
            /**
             * Format: double
             * @description Nuevo tamaño de porción en gramos.
             */
            portionSizeGrams: number;
            /** @description Nuevo conjunto de ingredientes. */
            ingredients: components["schemas"]["CustomFoodIngredientRequest"][] | null;
            /**
             * @description Confirma el guardado pese a coincidencias con alergias declaradas (US10 CA03). Por defecto
             *     false: si hay coincidencias sin confirmar, la respuesta es 409 con el detalle.
             */
            confirmedAllergens: boolean;
        };
        UpdateCustomFoodResult: {
            /** Format: uuid */
            customFoodId: string;
        };
        /** @description Cuerpo de la petición de registro del token de notificaciones push del dispositivo. */
        UpdateFcmTokenRequest: {
            /** @description Token de FCM del dispositivo, o null para desvincularlo. */
            fcmToken: string | null;
        };
        /**
         * @description Cuerpo de la petición de actualización del perfil clínico. Los campos en
         *     null no se modifican.
         */
        UpdatePatientProfileRequest: {
            /**
             * Format: double
             * @description Nuevo peso en kilogramos, opcional.
             */
            weightKg: number | null;
            /**
             * Format: double
             * @description Nueva estatura en centímetros, opcional.
             */
            heightCm: number | null;
            ibsSubtype: components["schemas"]["IbsSubtype"];
            /**
             * Format: date
             * @description Nueva fecha de diagnóstico, opcional.
             */
            diagnosisDate: string | null;
            /** @description Nueva medicación, opcional. */
            medications: string | null;
        };
        UpdatePatientProfileResult: {
            /** Format: double */
            bmi: number;
            bmiCategory: string | null;
            /** Format: int32 */
            age: number;
        };
        /** @enum {string} */
        UserStatus: "PendingActivation" | "Active" | "Inactive" | "Suspended";
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
