import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:cancerapp/models/article.dart';

class GNewsService {
  static const String _apiKey = 'b141853d87000a59b987df47da50672b';
  static const String _baseUrl = 'https://gnews.io/api/v4';

  /// Fetch cancer-related articles from GNews API
  Future<List<Article>> fetchCancerArticles({int maxResults = 3}) async {
    try {
      // Search for cancer awareness, prevention, and health articles
      final response = await http.get(
        Uri.parse(
          '$_baseUrl/search?q=cancer awareness OR cancer prevention OR cancer screening&lang=en&max=$maxResults&apikey=$_apiKey',
        ),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final articles = (data['articles'] as List)
            .map((articleJson) => Article.fromJson(articleJson))
            .toList();
        return articles;
      } else {
        throw Exception('Failed to load articles: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching articles: $e');
    }
  }

  /// Fetch top health headlines
  Future<List<Article>> fetchHealthHeadlines({int maxResults = 3}) async {
    try {
      final response = await http.get(
        Uri.parse(
          '$_baseUrl/top-headlines?category=health&lang=en&max=$maxResults&apikey=$_apiKey',
        ),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final articles = (data['articles'] as List)
            .map((articleJson) => Article.fromJson(articleJson))
            .toList();
        return articles;
      } else {
        throw Exception('Failed to load headlines: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching headlines: $e');
    }
  }
}
