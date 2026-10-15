enum PlayerRole {
  batsman,
  bowler,
  allRounder,
  wicketKeeper,
}

class Player {
  final String id;
  final String name;
  final PlayerRole role;
  final bool isCaptain;
  final bool isViceCaptain;
  final bool isWicketKeeper;
  final String? avatar;

  Player({
    required this.id,
    required this.name,
    required this.role,
    this.isCaptain = false,
    this.isViceCaptain = false,
    this.isWicketKeeper = false,
    this.avatar,
  });

  Player copyWith({
    String? id,
    String? name,
    PlayerRole? role,
    bool? isCaptain,
    bool? isViceCaptain,
    bool? isWicketKeeper,
    String? avatar,
  }) {
    return Player(
      id: id ?? this.id,
      name: name ?? this.name,
      role: role ?? this.role,
      isCaptain: isCaptain ?? this.isCaptain,
      isViceCaptain: isViceCaptain ?? this.isViceCaptain,
      isWicketKeeper: isWicketKeeper ?? this.isWicketKeeper,
      avatar: avatar ?? this.avatar,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'role': role.name,
        'isCaptain': isCaptain,
        'isViceCaptain': isViceCaptain,
        'isWicketKeeper': isWicketKeeper,
        'avatar': avatar,
      };

  factory Player.fromJson(Map<String, dynamic> json) => Player(
        id: json['id'] as String,
        name: json['name'] as String,
        role: PlayerRole.values.firstWhere(
          (e) => e.name == json['role'],
          orElse: () => PlayerRole.batsman,
        ),
        isCaptain: json['isCaptain'] as bool? ?? false,
        isViceCaptain: json['isViceCaptain'] as bool? ?? false,
        isWicketKeeper: json['isWicketKeeper'] as bool? ?? false,
        avatar: json['avatar'] as String?,
      );
}
