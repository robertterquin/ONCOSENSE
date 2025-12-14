class Article {
  final String title;
  final String description;
  final String url;
  final String? imageUrl;
  final String publishedAt;
  final String sourceName;

  Article({
    required this.title,
    required this.description,
    required this.url,
    this.imageUrl,
    required this.publishedAt,
    required this.sourceName,
  });

  factory Article.fromJson(Map<String, dynamic> json) {
    return Article(
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      url: json['url'] ?? '',
      imageUrl: json['image'],
      publishedAt: json['publishedAt'] ?? '',
      sourceName: json['source']?['name'] ?? 'Unknown',
    );
  }

  // Calculate estimated read time based on description length
  String get readTime {
    final wordCount = description.split(' ').length;
    final minutes = (wordCount / 200).ceil(); // Average reading speed
    return '$minutes min read';
  }
}
