import 'dart:convert';
import 'dart:math';
import 'package:http/http.dart' as http;
import 'package:cancerapp/models/article.dart';

class GNewsService {
  static const String _apiKey = 'b141853d87000a59b987df47da50672b';
  static const String _baseUrl = 'https://gnews.io/api/v4';
  final _random = Random();

  // Trusted medical and news sources (including Philippine sources)
  static const List<String> _trustedSources = [
    // Philippine news sources
    'abs-cbn.com',
    'gmanetwork.com',
    'inquirer.net',
    'philstar.com',
    'rappler.com',
    'mb.com.ph',
    'manilatimes.net',
    'sunstar.com.ph',
    'pna.gov.ph',
    'doh.gov.ph',
    'pchrd.dost.gov.ph',
    'pgh.gov.ph',
    // International trusted sources
    'who.int',
    'cdc.gov',
    'mayoclinic.org',
    'webmd.com',
    'healthline.com',
    'medicalnewstoday.com',
    'bbc.com',
    'bbc.co.uk',
    'nih.gov',
    'cancer.org',
    'cancer.gov',
    'cancerresearchuk.org',
    'nhs.uk',
    'health.harvard.edu',
    'hopkinsmedicine.org',
    'clevelandclinic.org',
    'reuters.com',
    'apnews.com',
    'sciencedaily.com',
    'nature.com',
    'thelancet.com',
    'medscape.com',
    'everydayhealth.com',
    'prevention.com',
    'ncbi.nlm.nih.gov',
  ];

  // Dangerous keywords to filter out
  static const List<String> _dangerousKeywords = [
    'cure cancer',
    'miracle cure',
    'alternative cure',
    'stop chemo',
    'avoid chemotherapy',
    'chemo kills',
    'cancer hoax',
    'natural cure',
    'secret cure',
    'big pharma conspiracy',
  ];

  /// Fetch cancer-related articles with randomization (prioritizes Philippine sources)
  Future<List<Article>> fetchCancerArticles({int maxResults = 3, String? query, bool philippineOnly = false}) async {
    try {
      // Use custom query or default to 'cancer'
      final searchQuery = query ?? 'cancer';
      
      // Try fetching from Philippines first
      var response = await http.get(
        Uri.parse(
          '$_baseUrl/search?q=$searchQuery&lang=en&country=ph&max=30&apikey=$_apiKey',
        ),
      );
      
      // If no Philippine results or error, fall back to international (unless philippineOnly is true)
      if (!philippineOnly && (response.statusCode != 200 || _getArticleCount(response.body) == 0)) {
        response = await http.get(
          Uri.parse(
            '$_baseUrl/search?q=$searchQuery&lang=en&max=30&apikey=$_apiKey',
          ),
        );
      }

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final allArticles = (data['articles'] as List)
            .map((articleJson) => Article.fromJson(articleJson))
            .toList();
        
        // First filter: safe content only
        var safeArticles = allArticles.where((article) {
          return _isSafeContent(article.title, article.description);
        }).toList();
        
        // Try to get trusted source articles first
        var trustedArticles = safeArticles.where((article) {
          return _isFromTrustedSource(article.url);
        }).toList();
        
        // If we have trusted articles, use them; otherwise use any safe articles
        var finalArticles = trustedArticles.isNotEmpty ? trustedArticles : safeArticles;
        
        // Shuffle for variety
        finalArticles.shuffle(_random);
        
        return finalArticles.take(maxResults).toList();
      } else {
        final errorBody = response.body;
        throw Exception('Failed to load articles: ${response.statusCode} - $errorBody');
      }
    } catch (e) {
      throw Exception('Error fetching articles: $e');
    }
  }

  /// Check if article is from a trusted source
  bool _isFromTrustedSource(String url) {
    final lowerUrl = url.toLowerCase();
    return _trustedSources.any((source) => lowerUrl.contains(source));
  }

  /// Check if article contains safe content (no dangerous claims)
  bool _isSafeContent(String title, String description) {
    final combinedText = '$title $description'.toLowerCase();
    
    // Check for dangerous keywords
    for (var keyword in _dangerousKeywords) {
      if (combinedText.contains(keyword.toLowerCase())) {
        return false;
      }
    }
    
    return true;
  }

  /// Fetch top health headlines from trusted sources (prioritizes Philippine sources)
  Future<List<Article>> fetchHealthHeadlines({int maxResults = 3, bool philippineOnly = false}) async {
    try {
      // Try fetching from Philippines first
      var response = await http.get(
        Uri.parse(
          '$_baseUrl/top-headlines?category=health&lang=en&country=ph&max=30&apikey=$_apiKey',
        ),
      );
      
      // If no Philippine results or error, fall back to international (unless philippineOnly is true)
      if (!philippineOnly && (response.statusCode != 200 || _getArticleCount(response.body) == 0)) {
        response = await http.get(
          Uri.parse(
            '$_baseUrl/top-headlines?category=health&lang=en&max=30&apikey=$_apiKey',
          ),
        );
      }

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final allArticles = (data['articles'] as List)
            .map((articleJson) => Article.fromJson(articleJson))
            .toList();
        
        // First filter: safe content only
        var safeArticles = allArticles.where((article) {
          return _isSafeContent(article.title, article.description);
        }).toList();
        
        // Try to get trusted source articles first
        var trustedArticles = safeArticles.where((article) {
          return _isFromTrustedSource(article.url);
        }).toList();
        
        // If we have trusted articles, use them; otherwise use any safe articles
        var finalArticles = trustedArticles.isNotEmpty ? trustedArticles : safeArticles;
        
        finalArticles.shuffle(_random);
        
        return finalArticles.take(maxResults).toList();
      } else {
        throw Exception('Failed to load headlines: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching headlines: $e');
    }
  }

  /// Helper to get article count from response body
  int _getArticleCount(String responseBody) {
    try {
      final data = json.decode(responseBody);
      final articles = data['articles'] as List?;
      return articles?.length ?? 0;
    } catch (e) {
      return 0;
    }
  }
}
