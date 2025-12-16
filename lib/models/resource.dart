class Resource {
  final String id;
  final String name;
  final String type; // 'hotline', 'screening_center', 'financial_support', 'support_group'
  final String description;
  final String? phone;
  final String? location;
  final String? address;
  final String? website;
  final String? email;
  final bool isVerified; // Only verified/reliable sources
  final bool isActive;
  final DateTime createdAt;

  Resource({
    required this.id,
    required this.name,
    required this.type,
    required this.description,
    this.phone,
    this.location,
    this.address,
    this.website,
    this.email,
    this.isVerified = false,
    this.isActive = true,
    required this.createdAt,
  });

  factory Resource.fromJson(Map<String, dynamic> json) {
    return Resource(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      type: json['type'] ?? '',
      description: json['description'] ?? '',
      phone: json['phone'],
      location: json['location'],
      address: json['address'],
      website: json['website'],
      email: json['email'],
      isVerified: json['is_verified'] ?? false,
      isActive: json['is_active'] ?? true,
      createdAt: json['created_at'] != null 
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'type': type,
      'description': description,
      'phone': phone,
      'location': location,
      'address': address,
      'website': website,
      'email': email,
      'is_verified': isVerified,
      'is_active': isActive,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
