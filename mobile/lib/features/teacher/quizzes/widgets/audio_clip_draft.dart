class AudioClipDraft {
  final String tempId;
  final int? id;
  String transcript;
  String voiceName;
  String sourceType; // 'tts' | 'upload'
  String? kdriveFileId;
  String? localFilePath;
  String? fileName;
  int? durationSeconds;
  int maxPlays;

  AudioClipDraft({
    required this.tempId,
    this.id,
    required this.transcript,
    this.voiceName = 'Kore',
    this.sourceType = 'tts',
    this.kdriveFileId,
    this.localFilePath,
    this.fileName,
    this.durationSeconds,
    this.maxPlays = 0,
  });

  Map<String, dynamic> toJson() => {
        if (id != null) 'id': id,
        'tempId': tempId,
        'transcript': transcript,
        'voiceName': voiceName,
        'sourceType': sourceType,
        'kdriveFileId': kdriveFileId,
        if (fileName != null) 'fileName': fileName,
        if (durationSeconds != null) 'durationSeconds': durationSeconds,
        'maxPlays': maxPlays,
      };

  factory AudioClipDraft.fromJson(Map<String, dynamic> json) {
    return AudioClipDraft(
      tempId: json['tempId'] ?? 'c_${json['id'] ?? DateTime.now().millisecondsSinceEpoch}',
      id: (json['id'] as num?)?.toInt(),
      transcript: json['transcript'] ?? '',
      voiceName: json['voice_name'] ?? json['voiceName'] ?? 'Kore',
      sourceType: json['source_type'] ?? json['sourceType'] ?? 'tts',
      kdriveFileId: json['kdrive_file_id']?.toString() ?? json['kdriveFileId']?.toString(),
      fileName: json['file_name'] ?? json['fileName'],
      durationSeconds: (json['duration_seconds'] ?? json['durationSeconds'] as num?)?.toInt(),
      maxPlays: (json['max_plays'] ?? json['maxPlays'] as num?)?.toInt() ?? 0,
    );
  }
}
