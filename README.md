# HealthCare

This is a Single Page Application with .Net core + VueJS

Front-end part: https://github.com/davidtodorov/HealthCare/tree/master/HealthCareApiServer/WebApp/client-app
Back-end part: https://github.com/davidtodorov/HealthCare/tree/master/HealthCareApiServer

## AI Care Navigator

The Care Navigator chatbot uses OpenAI's Responses API to triage symptoms, suggest departments, and surface the best-matching doctors with open slots. To enable the assistant locally, provide an API key in `appsettings.json` (or via [user secrets](https://learn.microsoft.com/aspnet/core/security/app-secrets)): 

```json
"OpenAI": {
  "ApiKey": "YOUR_API_KEY",
  "Model": "gpt-4.1-mini",
  "Temperature": 0.2
}
```

If the key is missing, the chatbot endpoints will return a helpful error message instead of making a remote call.
