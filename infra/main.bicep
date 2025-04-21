targetScope = 'subscription'

@minLength(1)
@maxLength(64)
@description('Name of the the environment which is used to generate a short unique hash used in all resources.')
param name string

@minLength(1)
@description('Primary location for all resources')
param location string

// azure open ai -- regions currently support gpt-4o global-standard
@description('Location for the OpenAI resource group')
@allowed(['australiaeast', 'brazilsouth', 'canadaeast', 'eastus', 'eastus2', 'francecentral', 'germanywestcentral', 'japaneast', 'koreacentral', 'northcentralus', 'norwayeast', 'polandcentral', 'spaincentral', 'southafricanorth', 'southcentralus', 'southindia', 'swedencentral', 'switzerlandnorth', 'uksouth', 'westeurope', 'westus', 'westus3'])
@metadata({
  azd: {
    type: 'location'
  }
})

param openAILocation string

param openAISku string = 'S0'
param openAIApiVersion string ='2024-08-01-preview'

param chatGptDeploymentCapacity int = 10
param chatGptDeploymentName string = 'gpt-4o'
param chatGptModelName string = 'gpt-4o'
param chatGptModelVersion string = '2024-05-13'
param embeddingDeploymentName string = 'embedding'
param embeddingDeploymentCapacity int = 50
param embeddingModelName string = 'text-embedding-ada-002'


@minLength(1)
@description('Enter your Azure user principal name (e.g. jane.doe@contoso.com)')
param userPrincipalName string
param neonPostgresName string = 'neon-postgres'
param formRecognizerSkuName string = 'S0'

// TODO: define good default Sku and settings for storage account
param storageServiceSku object = { name: 'Standard_LRS' } 
param storageServiceImageContainerName string = 'images'

param resourceGroupName string = ''

var resourceToken = toLower(uniqueString(subscription().id, name, location))
var tags = { 'azd-env-name': name }

// Organize resources in a resource group
resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: !empty(resourceGroupName) ? resourceGroupName : 'rg-${name}'
  location: location
  tags: tags
}

module resources 'resources.bicep' = {
  name: 'all-resources'
  scope: rg
  params: {
    name: name
    tags: tags
    userPrincipalName: userPrincipalName
    neonPostgresName: neonPostgresName
    openai_api_version: openAIApiVersion
    openAiLocation: openAILocation
    openAiSkuName: openAISku
    chatGptDeploymentCapacity: chatGptDeploymentCapacity
    chatGptDeploymentName: chatGptDeploymentName
    chatGptModelName: chatGptModelName
    chatGptModelVersion: chatGptModelVersion
    embeddingDeploymentName: embeddingDeploymentName
    embeddingDeploymentCapacity: embeddingDeploymentCapacity
    embeddingModelName: embeddingModelName
  
    formRecognizerSkuName: formRecognizerSkuName
    storageServiceSku: storageServiceSku
    storageServiceImageContainerName: storageServiceImageContainerName
    location: location
  }
}

output APP_URL string = resources.outputs.url
output AZURE_LOCATION string = location
output AZURE_TENANT_ID string = tenant().tenantId
