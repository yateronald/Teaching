class UserModel {
  final int id;
  final String username;
  final String email;
  final String role;
  final String firstName;
  final String lastName;
  final String? timezone;
  final String? profilePhotoUrl;
  final String? bio;

  UserModel({
    required this.id,
    required this.username,
    required this.email,
    required this.role,
    required this.firstName,
    required this.lastName,
    this.timezone,
    this.profilePhotoUrl,
    this.bio,
  });

  String get fullName => '$firstName $lastName'.trim().isEmpty ? username : '$firstName $lastName'.trim();
  String get initials {
    final first = firstName.isNotEmpty ? firstName[0] : (username.isNotEmpty ? username[0] : '?');
    final last = lastName.isNotEmpty ? lastName[0] : '';
    return '$first$last'.toUpperCase();
  }

  bool get isTeacher => role == 'teacher';
  bool get isAdmin => role == 'admin';

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id'].toString()) ?? 0,
      username: json['username'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? 'teacher',
      firstName: json['first_name'] ?? json['firstName'] ?? '',
      lastName: json['last_name'] ?? json['lastName'] ?? '',
      timezone: json['timezone'],
      profilePhotoUrl: json['profile_photo_url'] ?? json['avatarUrl'],
      bio: json['bio'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'email': email,
      'role': role,
      'first_name': firstName,
      'last_name': lastName,
      'timezone': timezone,
      'profile_photo_url': profilePhotoUrl,
      'bio': bio,
    };
  }
}
