using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Options;
using WebApp.Options;

namespace WebApp.Services
{
    public class OpenAiClient
    {
        private const string ResponsesPath = "responses";
        private static readonly Uri BaseAddress = new("https://api.openai.com/v1/");

        private readonly HttpClient httpClient;
        private readonly OpenAiOptions options;
        private readonly JsonSerializerOptions serializerOptions;

        public OpenAiClient(HttpClient httpClient, IOptions<OpenAiOptions> optionsAccessor)
        {
            this.httpClient = httpClient;
            this.httpClient.BaseAddress ??= BaseAddress;

            this.options = optionsAccessor.Value;

            this.serializerOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
            };
        }

        public async Task<T> GenerateJsonAsync<T>(string systemPrompt, object userPayload, string schemaName, JsonObject schema, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(this.options.ApiKey))
            {
                throw new InvalidOperationException("OpenAI API key is not configured. Set OpenAI:ApiKey in configuration or user secrets.");
            }

            var request = BuildRequest(systemPrompt, userPayload, schemaName, schema);

            var httpRequest = new HttpRequestMessage(HttpMethod.Post, ResponsesPath)
            {
                Content = new StringContent(JsonSerializer.Serialize(request, serializerOptions), Encoding.UTF8, "application/json")
            };

            httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", this.options.ApiKey);
            httpRequest.Headers.TryAddWithoutValidation("OpenAI-Beta", "response-format=v1");

            using var response = await httpClient.SendAsync(httpRequest, cancellationToken);
            var content = await response.Content.ReadAsStringAsync(cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                throw new InvalidOperationException($"OpenAI request failed with status {(int)response.StatusCode}: {content}");
            }

            try
            {
                return DeserializeResponse<T>(content);
            }
            catch (JsonException ex)
            {
                throw new InvalidOperationException("OpenAI response could not be parsed.", ex);
            }
        }

        private OpenAiResponseRequest BuildRequest(string systemPrompt, object userPayload, string schemaName, JsonObject schema)
        {
            var userContent = JsonSerializer.Serialize(userPayload, serializerOptions);

            return new OpenAiResponseRequest
            {
                Model = string.IsNullOrWhiteSpace(this.options.Model) ? "gpt-4.1-mini" : this.options.Model,
                Temperature = this.options.Temperature,
                Input =
                [
                    new OpenAiMessage
                    {
                        Role = "system",
                        Content =
                        [
                            new OpenAiContent
                            {
                                Type = "text",
                                Text = systemPrompt
                            }
                        ]
                    },
                    new OpenAiMessage
                    {
                        Role = "user",
                        Content =
                        [
                            new OpenAiContent
                            {
                                Type = "text",
                                Text = userContent
                            }
                        ]
                    }
                ],
                ResponseFormat = new OpenAiResponseFormat
                {
                    Type = "json_schema",
                    JsonSchema = new OpenAiJsonSchema
                    {
                        Name = schemaName,
                        Schema = schema
                    }
                }
            };
        }

        private T DeserializeResponse<T>(string rawResponse)
        {
            using var document = JsonDocument.Parse(rawResponse);
            if (!document.RootElement.TryGetProperty("output", out var outputArray))
            {
                throw new InvalidOperationException("OpenAI response did not contain an output array.");
            }

            var builder = new StringBuilder();
            foreach (var item in outputArray.EnumerateArray())
            {
                if (!item.TryGetProperty("content", out var contentArray))
                {
                    continue;
                }

                foreach (var contentItem in contentArray.EnumerateArray())
                {
                    if (contentItem.TryGetProperty("type", out var typeProp) && typeProp.GetString() == "output_text")
                    {
                        var text = contentItem.GetProperty("text").GetString();
                        if (!string.IsNullOrWhiteSpace(text))
                        {
                            builder.Append(text);
                        }
                    }
                }
            }

            var jsonText = builder.ToString();
            if (string.IsNullOrWhiteSpace(jsonText))
            {
                throw new InvalidOperationException("OpenAI response did not contain any textual content.");
            }

            var result = JsonSerializer.Deserialize<T>(jsonText, serializerOptions);
            if (result is null)
            {
                throw new InvalidOperationException("Failed to deserialize OpenAI response to the expected type.");
            }

            return result;
        }

        private class OpenAiResponseRequest
        {
            [JsonPropertyName("model")]
            public string Model { get; set; } = string.Empty;

            [JsonPropertyName("input")]
            public List<OpenAiMessage> Input { get; set; } = new();

            [JsonPropertyName("response_format")]
            public OpenAiResponseFormat? ResponseFormat { get; set; }

            [JsonPropertyName("temperature")]
            public double? Temperature { get; set; }
        }

        private class OpenAiMessage
        {
            [JsonPropertyName("role")]
            public string Role { get; set; } = string.Empty;

            [JsonPropertyName("content")]
            public List<OpenAiContent> Content { get; set; } = new();
        }

        private class OpenAiContent
        {
            [JsonPropertyName("type")]
            public string Type { get; set; } = "text";

            [JsonPropertyName("text")]
            public string Text { get; set; } = string.Empty;
        }

        private class OpenAiResponseFormat
        {
            [JsonPropertyName("type")]
            public string Type { get; set; } = "json_schema";

            [JsonPropertyName("json_schema")]
            public OpenAiJsonSchema? JsonSchema { get; set; }
        }

        private class OpenAiJsonSchema
        {
            [JsonPropertyName("name")]
            public string Name { get; set; } = string.Empty;

            [JsonPropertyName("schema")]
            public JsonObject Schema { get; set; } = new();
        }
    }
}
