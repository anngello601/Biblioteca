package com.example.Biblioteca.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class CatalogoExternoService {

    private final ObjectMapper objectMapper;
    private final String googleBooksApiKey;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    public CatalogoExternoService(ObjectMapper objectMapper,
                                  @Value("${google.books.api-key:}") String googleBooksApiKey) {
        this.objectMapper = objectMapper;
        this.googleBooksApiKey = googleBooksApiKey;
    }

    public List<Map<String, Object>> buscar(String consulta, int limite) {
        if (consulta == null || consulta.isBlank()) {
            throw new IllegalArgumentException("La búsqueda no puede estar vacía");
        }

        int cantidad = Math.min(Math.max(limite, 1), 20);
        String texto = consulta.trim();

        List<Map<String, Object>> resultados = buscarGoogleBooks(texto, cantidad);
        if (resultados.isEmpty()) {
            resultados = buscarOpenLibrary(texto, cantidad);
        }
        return resultados;
    }

    private List<Map<String, Object>> buscarGoogleBooks(String consulta, int limite) {
        List<Map<String, Object>> resultados = new ArrayList<>();
        try {
            StringBuilder url = new StringBuilder("https://www.googleapis.com/books/v1/volumes?q=");
            url.append(URLEncoder.encode(consulta, StandardCharsets.UTF_8));
            url.append("&maxResults=").append(limite);
            if (!googleBooksApiKey.isBlank()) {
                url.append("&key=").append(URLEncoder.encode(googleBooksApiKey, StandardCharsets.UTF_8));
            }

            JsonNode raiz = obtenerJson(url.toString());
            for (JsonNode item : raiz.path("items")) {
                JsonNode volumen = item.path("volumeInfo");
                Map<String, Object> libro = nuevoResultado();
                libro.put("nombre", texto(volumen.path("title")));
                libro.put("autor", unirAutores(volumen.path("authors")));
                libro.put("editorial", texto(volumen.path("publisher")));
                libro.put("descripcion", texto(volumen.path("description")));
                libro.put("anioPublicacion", obtenerAnio(texto(volumen.path("publishedDate"))));
                libro.put("portada", obtenerPortada(volumen.path("imageLinks")));
                libro.put("isbn", obtenerIsbn(volumen.path("industryIdentifiers")));
                libro.put("fuente", "Google Books");
                if (!texto(volumen.path("title")).isBlank()) {
                    resultados.add(libro);
                }
            }
        } catch (Exception e) {
            // Open Library se utiliza como respaldo.
        }
        return resultados;
    }

    private List<Map<String, Object>> buscarOpenLibrary(String consulta, int limite) {
        List<Map<String, Object>> resultados = new ArrayList<>();
        try {
            String url = "https://openlibrary.org/search.json?q="
                    + URLEncoder.encode(consulta, StandardCharsets.UTF_8)
                    + "&limit=" + limite;
            JsonNode raiz = obtenerJson(url);

            for (JsonNode item : raiz.path("docs")) {
                Map<String, Object> libro = nuevoResultado();
                libro.put("nombre", texto(item.path("title")));
                libro.put("autor", unirAutores(item.path("author_name")));
                libro.put("editorial", unirAutores(item.path("publisher")));
                libro.put("descripcion", texto(item.path("first_sentence").isArray()
                        ? item.path("first_sentence").get(0)
                        : item.path("first_sentence")));
                libro.put("anioPublicacion", obtenerAnio(item.path("first_publish_year")));
                libro.put("portada", item.path("cover_i").isMissingNode()
                        ? ""
                        : "https://covers.openlibrary.org/b/id/" + item.path("cover_i").asText() + "-L.jpg");
                libro.put("isbn", obtenerPrimerValor(item.path("isbn")));
                libro.put("fuente", "Open Library");
                if (!texto(item.path("title")).isBlank()) {
                    resultados.add(libro);
                }
            }
        } catch (Exception e) {
            throw new IllegalStateException("No se pudo consultar el catálogo externo");
        }
        return resultados;
    }

    private JsonNode obtenerJson(String url) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(URI.create(url))
                .header("Accept", "application/json")
                .GET()
                .build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() >= 400) {
            throw new IllegalStateException("API externa respondió " + response.statusCode());
        }
        return objectMapper.readTree(response.body());
    }

    private Map<String, Object> nuevoResultado() {
        Map<String, Object> libro = new LinkedHashMap<>();
        libro.put("tipo", "FISICO");
        libro.put("precio", 0);
        libro.put("stock", 0);
        return libro;
    }

    private String unirAutores(JsonNode node) {
        if (!node.isArray()) return texto(node);
        List<String> valores = new ArrayList<>();
        for (JsonNode value : node) {
            if (!value.asText().isBlank()) valores.add(value.asText());
        }
        return String.join(", ", valores);
    }

    private String obtenerPortada(JsonNode links) {
        if (links.isMissingNode()) return "";
        String url = texto(links.path("thumbnail"));
        if (url.isBlank()) url = texto(links.path("smallThumbnail"));
        return url.startsWith("http://") ? "https://" + url.substring("http://".length()) : url;
    }

    private String obtenerIsbn(JsonNode identifiers) {
        if (!identifiers.isArray()) return "";
        for (JsonNode identifier : identifiers) {
            String tipo = identifier.path("type").asText();
            if (tipo.contains("ISBN_13")) return identifier.path("identifier").asText();
        }
        for (JsonNode identifier : identifiers) {
            if (identifier.path("type").asText().contains("ISBN")) {
                return identifier.path("identifier").asText();
            }
        }
        return "";
    }

    private String obtenerPrimerValor(JsonNode node) {
        if (!node.isArray() || node.isEmpty()) return "";
        return node.get(0).asText();
    }

    private Integer obtenerAnio(String fecha) {
        if (fecha == null || fecha.isBlank()) return 0;
        try {
            return Integer.parseInt(fecha.substring(0, 4));
        } catch (Exception e) {
            return 0;
        }
    }

    private Integer obtenerAnio(JsonNode node) {
        if (!node.isIntegralNumber()) return 0;
        return node.asInt();
    }

    private String texto(JsonNode node) {
        if (node == null || node.isMissingNode() || node.isNull()) return "";
        return node.asText();
    }
}
