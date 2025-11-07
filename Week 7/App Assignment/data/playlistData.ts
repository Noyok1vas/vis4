import { Playlist, Song } from './types';

// 歌曲数据列表
export const songs: Song[] = [
  {
    id: 1,
    title: 'Sweet Dream',
    artist: 'Hex Courgar',
    albumArt: require('../assets/albumPic/A_SweetDream.png'),
    audioFile: require('../assets/sound/SweetDream[EQedit].mp3'),
  },
  {
    id: 2,
    title: 'Panic Attack',
    artist: 'Alisky',
    albumArt: require('../assets/albumPic/A_PanicAttack.png'),
    audioFile: require('../assets/sound/PanicAttack[EQedit].mp3'),
  },
  {
    id: 3,
    title: 'Confrontation',
    artist: 'Homegrown Syndrome',
    albumArt: require('../assets/albumPic/A_Confrontation.png'),
    audioFile: require('../assets/sound/Confrontation[Original].mp3'),
  },
  {
    id: 4,
    title: '快乐崇拜',
    artist: 'Will Pan',
    albumArt: require('../assets/albumPic/A_HappyWorship.jpg'),
    audioFile: require('../assets/sound/HappyWorship[EQedit].mp3'),
  },
  {
    id: 5,
    title: 'React',
    artist: 'The Pussycat Dolls',
    albumArt: require('../assets/albumPic/A_React.jpg'),
    audioFile: require('../assets/sound/React[EQedit].mp3'),
  },
  {
    id: 6,
    title: 'Vegas',
    artist: 'Doja Cat',
    albumArt: require('../assets/albumPic/A_Vegas.png'),
    audioFile: require('../assets/sound/Vegas[EQedit].mp3'),
  },
];

// 默认播放列表
export const defaultPlaylist: Playlist = {
  name: 'Playlist Name',
  author: 'User',
  songs: songs,
};

// 获取歌曲 by ID
export const getSongById = (id: number): Song | undefined => {
  return songs.find(song => song.id === id);
};

// 获取所有播放列表（未来可扩展为多个播放列表）
export const getAllPlaylists = (): Playlist[] => {
  return [defaultPlaylist];
};

