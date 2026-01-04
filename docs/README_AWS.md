# Deploy to AWS (Quick guide)

This project is a Next.js app prepared to run in Docker and can be deployed to AWS ECR + ECS.

Required env vars for runtime (set in ECS Task Definition or as container env):

- `AWS_REGION` - AWS region (e.g. `us-east-1`)
- `AWS_DYNAMODB_TABLE` - (optional) DynamoDB table name if you want persistent history
- `AWS_SNS_TOPIC_ARN` - (optional) SNS topic ARN for realtime publish (multi-instance)
- Other app-specific envs (e.g. DB, auth) as needed

Build & run locally with Docker:

```bash
# build
docker build -t my-service-monitor .

# run (example)
docker run -p 3000:3000 --env NODE_ENV=production my-service-monitor
```

GitHub Actions (example):
- The workflow `.github/workflows/ecr-deploy.yml` builds the Docker image and pushes to ECR on push to `main`.
- You must add repository secrets:
  - `AWS_REGION`
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `ECR_REPOSITORY` (name of the ECR repo)
  - Optionally `ECS_CLUSTER` and `ECS_SERVICE` if you want the workflow to trigger an ECS deployment.

Notes on realtime multi-instance deployments:
- The app uses an in-memory pub/sub for SSE in development (`lib/realtime.ts`). For multi-instance production you should:
  - Use DynamoDB for persistent history (the code supports it via `lib/aws-realtime.ts`), and
  - Use SNS + a push/forwarder to send real-time events to connected clients (API Gateway WebSockets or a dedicated WebSocket gateway/Lambda).

Security and production tips:
- Protect API routes with authentication.
- Use IAM roles for ECS tasks instead of long-lived credentials.
- Configure health checks and metrics in ECS service.

If you want, I can add an ECS Task Definition template and a sample Terraform/CloudFormation stack next.
