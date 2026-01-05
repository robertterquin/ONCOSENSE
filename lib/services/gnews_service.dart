import 'dart:convert';
import 'dart:math';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:cancerapp/models/article.dart';
import 'package:cancerapp/utils/constants.dart';

/// GNews API Service - Cancer-related news articles
/// 
/// Attribution: News articles powered by GNews API (https://gnews.io)
/// 
/// This service fetches cancer-related news from trusted medical sources
/// and applies content filtering to ensure safe, accurate information.
/// 
/// GNews API Terms: https://gnews.io/terms
/// Please ensure compliance with GNews API usage terms and attribution requirements.
class GNewsService {
  static const String _apiKey = 'b141853d87000a59b987df47da50672b';
  static const String _baseUrl = 'https://gnews.io/api/v4';
  final _random = Random();

  // Trusted medical and news sources
  static const List<String> _trustedSources = [
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

  // Horoscope/Astrology keywords to filter out (Cancer zodiac sign confusion)
  static const List<String> _horoscopeKeywords = [
    'horoscope',
    'zodiac',
    'astrology',
    'tarot',
    'aries',
    'taurus',
    'gemini',
    'leo',
    'virgo',
    'libra',
    'scorpio',
    'sagittarius',
    'capricorn',
    'aquarius',
    'pisces',
    'daily horoscope',
    'love horoscope',
    'cancer horoscope',
    'cancer zodiac',
    'june 21',
    'july 22',
    'star sign',
    'birth chart',
    'astrological',
    'moon sign',
    'sun sign',
    'rising sign',
    'cosmic',
  ];

  /// Fetch cancer-related articles with randomization
  Future<List<Article>> fetchCancerArticles({int maxResults = 3, String? query}) async {
    try {
      // Use custom query or default to 'cancer'
      final searchQuery = query ?? 'cancer';
      
      // Fetch international articles
      final response = await http.get(
        Uri.parse(
          '$_baseUrl/search?q=$searchQuery&lang=en&max=${DataLimits.newsArticlesMax}&apikey=$_apiKey',
        ),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final allArticles = (data['articles'] as List)
            .map((articleJson) => Article.fromJson(articleJson))
            .toList();
        
        // First filter: safe content only
        var safeArticles = allArticles.where((article) {
          return _isSafeContent(article.title, article.description);
        }).toList();
        
        // Separate trusted and other articles
        var trustedArticles = safeArticles.where((article) {
          return _isFromTrustedSource(article.url);
        }).toList();
        
        var otherArticles = safeArticles.where((article) {
          return !_isFromTrustedSource(article.url);
        }).toList();
        
        // Mix trusted articles (prioritized) with other articles
        trustedArticles.shuffle(_random);
        otherArticles.shuffle(_random);
        
        // Take all trusted articles first, then fill with other articles if needed
        var finalArticles = <Article>[...trustedArticles];
        if (finalArticles.length < maxResults) {
          finalArticles.addAll(otherArticles.take(maxResults - finalArticles.length));
        }
        
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

  /// Check if article contains safe content (no dangerous claims or horoscopes)
  bool _isSafeContent(String title, String description) {
    final combinedText = '$title $description'.toLowerCase();
    
    // Check for dangerous keywords
    for (var keyword in _dangerousKeywords) {
      if (combinedText.contains(keyword.toLowerCase())) {
        return false;
      }
    }
    
    // Check for horoscope/astrology keywords
    for (var keyword in _horoscopeKeywords) {
      if (combinedText.contains(keyword.toLowerCase())) {
        return false;
      }
    }
    
    return true;
  }

  /// Fetch top health headlines from trusted sources
  Future<List<Article>> fetchHealthHeadlines({int maxResults = 3}) async {
    try {
      // Fetch international health headlines
      final response = await http.get(
        Uri.parse(
          '$_baseUrl/top-headlines?category=health&lang=en&max=${DataLimits.newsArticlesMax}&apikey=$_apiKey',
        ),
      );

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
