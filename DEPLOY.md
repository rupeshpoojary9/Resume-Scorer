# Deployment Instructions for e42-foundry

## 1. Prerequisites
- **Docker & Docker Compose**: Ensure Docker Desktop is installed and running.
- **GitLab Access**: You must have Maintainer access to the `e42-foundry` repository to push the initial branch.

## 2. Repository Setup
The project is configured to push to:
`https://gitlabproxy.lightinfosys.com/e42/product/e42-foundry.git`

To push changes:
```bash
git push deploy main
```

## 3. Troubleshooting: "Pre-receive hook declined"
If you see an error like:
> "A default branch (e.g. main) does not yet exist... pre-receive hook declined"

This means the GitLab server is blocking the creation of the initial branch via the command line.

**Solution:**
1.  Go to the GitLab UI: [e42-foundry Project](https://gitlabproxy.lightinfosys.com/e42/product/e42-foundry)
2.  Create a `README.md` or any file in the UI to initialize the repository and create the default branch (`main` or `master`).
3.  Once the branch exists, pull it locally:
    ```bash
    git pull deploy main --allow-unrelated-histories
    ```
4.  Then push your changes:
    ```bash
    git push deploy main
    ```

## 4. Running Production Build
Once the code is deployed, run:
```bash
docker-compose up --build -d
```
This will start:
-   **Frontend**: Port 8081 (Nginx)
-   **Backend**: Port 8003 (Uvicorn)
-   **Database**: Port 5432 (PostgreSQL)

## 5. Database & Persistence
The application uses **PostgreSQL**.
-   Data is persisted in a Docker volume named `postgres_data`.
-   The database URL is automatically configured in `docker-compose.yml`.
-   **Backup**: To back up data, you can run:
    ```bash
    docker exec -t <container_id> pg_dumpall -c -U postgres > dump_`date +%d-%m-%Y"_"%H_%M_%S`.sql
    ```
## 6. Troubleshooting: "KeyError: 'ContainerConfig'"
If you see an error like `KeyError: 'ContainerConfig'` when running `docker-compose`, it means you are using an outdated version of Docker Compose (v1) that is incompatible with the current Docker state.

**Solution:**
1.  **Use the new command**: Try running `docker compose` (with a space) instead of `docker-compose` (with a hyphen).
    ```bash
    docker compose up --build -d
    ```
2.  **Clean up old containers**: If that fails, remove the stuck containers manually:
    ```bash
    docker rm -f e42-foundry_frontend_1 e42-foundry_backend_1
    docker compose up --build -d
    ```
