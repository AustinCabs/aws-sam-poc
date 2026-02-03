# AWS SAM TypeScript POC

A serverless application built with **AWS SAM**, **TypeScript**, **API Gateway (HTTP API)**, **Lambda**, and **DynamoDB**. CloudWatch Logs are automatically enabled for all Lambda functions.

## Project structure

```
aws-sam-poc/
├── template.yaml           # SAM template (API Gateway, Lambda, DynamoDB)
├── samconfig.toml          # SAM CLI config (dev/staging/prod)
├── package.json            # Root dev dependencies and scripts
├── tsconfig.json           # Root TypeScript config
├── functions/              # Lambda functions
│   ├── list-items/         # GET /items
│   ├── get-item/           # GET /items/{id}
│   └── create-item/        # POST /items
├── layers/
│   └── common/             # Shared utilities (logger, response, DynamoDB)
├── tests/
│   └── integration/       # API integration tests
├── infrastructure/         # Extra infra (optional)
└── scripts/                # Build and deploy scripts
```

## Prerequisites

- **Node.js** 20.x or later
- **AWS SAM CLI** ([Install](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html))
- **AWS CLI** configured with credentials
- **Docker** (for `sam local`)

## Setup

1. **Install root dependencies**

   ```bash
   npm install
   ```

2. **Build the Lambda layer** (shared code and its dependencies). `esbuild` is used by SAM to build Lambda functions and is installed at the root; ensure you have run `npm install` from the project root first.

   ```bash
   cd layers/common && npm install && npm run build && cd ../..
   ```

3. **Build the SAM application**

   ```bash
   npm run build
   # or: ./scripts/build.sh
   ```

4. **Validate the template**

   ```bash
   npm run validate
   ```

## Local development

Start the API locally (Docker required):

```bash
npm run start
# or: sam local start-api
```

- API base URL: `http://127.0.0.1:3000`
- Endpoints:
  - `GET /items` – list items
  - `GET /items/{id}` – get one item
  - `POST /items` – create item (body: `{ "name": "…", "description": "…" }`)

Example:

```bash
curl -X POST http://127.0.0.1:3000/items \
  -H "Content-Type: application/json" \
  -d '{"name":"My Item","description":"Test"}'
curl http://127.0.0.1:3000/items
```

## Deployment

Deploy to the default (dev) config:

```bash
npm run deploy
# or: ./scripts/deploy.sh
# or: sam deploy --config-env default
```

Deploy to staging or production:

```bash
sam deploy --config-env staging
sam deploy --config-env prod
```

After deployment, the **ApiUrl** and **ItemsTableName** are in the stack outputs.

## Testing

- **Unit tests** (when added under `functions/` or `layers/`):

  ```bash
  npm test
  ```

- **Integration tests** (run against a running API, e.g. `sam local start-api`):

  ```bash
  API_BASE_URL=http://127.0.0.1:3000 npm run test:integration
  ```

## CloudWatch

- **Logs**: Each Lambda function writes to CloudWatch Logs automatically; no extra configuration is required.
- **Metrics**: Lambda and API Gateway metrics are available in CloudWatch by default.
- **Custom metrics**: Use the AWS SDK in your handlers to publish custom metrics if needed.

## Environment configuration

- **Environment**: Set via the `Environment` parameter in `samconfig.toml` or when deploying (e.g. `dev`, `staging`, `prod`).
- **Log level**: Controlled by `LOG_LEVEL` in the template (e.g. `debug` in non-prod, `info` in prod).

## Scripts reference

| Script                     | Command               | Description                   |
| -------------------------- | --------------------- | ----------------------------- |
| `npm run build`            | `sam build`           | Build all functions and layer |
| `npm run deploy`           | `sam deploy`          | Deploy using samconfig.toml   |
| `npm run start`            | `sam local start-api` | Run API locally               |
| `npm run validate`         | `sam validate`        | Validate template             |
| `npm test`                 | `jest`                | Run unit tests                |
| `npm run test:integration` | `jest` (tests/)       | Run integration tests         |

## License

Private / internal use.
