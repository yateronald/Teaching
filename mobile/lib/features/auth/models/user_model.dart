class UserModel {
  final int id;
  final String username;
  final String email;
  final String role;
  final String firstName;
  final String lastName;
  final String? timezone;
  final String? profilePhotoUrl;
  final String? profilePhotoKdriveFileId;
  final String? createdAt;
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
    this.profilePhotoKdriveFileId,
    this.createdAt,
    this.bio,
  });

  String get fullName =>
      '$firstName $lastName'.trim().isEmpty ? username : '$firstName $lastName'.trim();

  String get initials {
    final first = firstName.isNotEmpty
        ? firstName[0]
        : (username.isNotEmpty ? username[0] : '?');
    final last = lastName.isNotEmpty ? lastName[0] : '';
    return '$first$last'.toUpperCase();
  }

  bool get isTeacher => role == 'teacher';
  bool get isAdmin => role == 'admin';
  bool get hasPhoto =>
      (profilePhotoKdriveFileId != null && profilePhotoKdriveFileId!.isNotEmpty) ||
      (profilePhotoUrl != null && profilePhotoUrl!.isNotEmpty);

  String formattedJoinedDate(bool isFrench) {
    if (createdAt == null || createdAt!.isEmpty) return '—';
    try {
      final s = createdAt!.contains('T') ? createdAt! : createdAt!.replaceAll(' ', 'T');
      final dt = DateTime.parse(s);
      final monthsFr = [
        '', 'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
        'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
      ];
      final monthsEn = [
        '', 'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      final m = isFrench ? monthsFr[dt.month] : monthsEn[dt.month];
      return '${dt.day} $m ${dt.year}';
    } catch (_) {
      return createdAt!;
    }
  }

  UserModel copyWith({
    int? id,
    String? username,
    String? email,
    String? role,
    String? firstName,
    String? lastName,
    String? timezone,
    String? profilePhotoUrl,
    String? profilePhotoKdriveFileId,
    String? createdAt,
    String? bio,
  }) {
    return UserModel(
      id: id ?? this.id,
      username: username ?? this.username,
      email: email ?? this.email,
      role: role ?? this.role,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      timezone: timezone ?? this.timezone,
      profilePhotoUrl: profilePhotoUrl ?? this.profilePhotoUrl,
      profilePhotoKdriveFileId:
          profilePhotoKdriveFileId ?? this.profilePhotoKdriveFileId,
      createdAt: createdAt ?? this.createdAt,
      bio: bio ?? this.bio,
    );
  }

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
      profilePhotoKdriveFileId: json['profile_photo_kdrive_file_id']?.toString(),
      createdAt: json['created_at']?.toString(),
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
      'profile_photo_kdrive_file_id': profilePhotoKdriveFileId,
      'created_at': createdAt,
      'bio': bio,
    };
  }
}
