# ☁️ Deploy to Azure - GitHub Actions

The following steps describes how the application can be deployed to Azure App service using GitHub Actions.

## 🧬 Fork the repository

Fork this repository to your own organisation so that you can execute GitHub Actions against your own Azure Subscription.

## 🗝️ Configure secrets in your GitHub repository

### 1. AZURE_CREDENTIALS

The GitHub workflow requires a secret named `AZURE_CREDENTIALS` to authenticate with Azure. The secret contains the credentials for a service principal with the Contributor role on the resource group containing the container app and container registry.

1. Before you login a service principal secret, you need to prepare a service principal with a secret.

- [Create a service principal and assign a role to it](https://learn.microsoft.com/entra/identity-platform/howto-create-service-principal-portal)
- [Create a new service principal client secret](https://learn.microsoft.com/entra/identity-platform/howto-create-service-principal-portal#option-3-create-a-new-client-secret)

2. After it, create a GitHub Action secret `AZURE_CREDENTIALS` with the value like below: (Refer to [Using secrets in GitHub Actions](https://docs.github.com/actions/security-guides/using-secrets-in-github-actions).)

   ```json
   {
       "clientSecret":  "******",
       "subscriptionId":  "******",
       "tenantId":  "******",
       "clientId":  "******"
   }
   ```

- clientSecret: the service principal client secret
- subscriptionId: the subscription ID
- tenantId: the tenant ID
- clientId: the service principal client ID

3. In the GitHub repository, navigate to Settings > Secrets > Actions and select New repository secret.

4. Enter `AZURE_CREDENTIALS` as the name and paste the contents of the JSON output as the value.

5. Select **Add secret**.

### 2. AZURE_APP_SERVICE_NAME

Under the same repository secrets add a new variable `AZURE_APP_SERVICE_NAME` to deploy to your Azure Web app. The value of this secret is the name of your Azure Web app e.g. `my-web-app-name` from the domain https://my-web-app-name.azurewebsites.net/

### 3. Run GitHub Actions

Once the secrets are configured, the GitHub Actions will be triggered for every code push to the repository. Alternatively, you can manually run the workflow by clicking on the "Run Workflow" button in the Actions tab in GitHub.
