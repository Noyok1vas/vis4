// 歌曲数据类型
export interface Song {
  id: number;
  title: string;
  artist: string;
  albumArt: any; // React Native Image source type
  audioFile: any; // React Native audio file source type
}

// 播放列表数据类型
export interface Playlist {
  id?: number;
  name: string;
  author: string;
  songs: Song[];
}

