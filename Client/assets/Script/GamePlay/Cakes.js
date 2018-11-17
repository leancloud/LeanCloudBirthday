import BombAnimCtrl from './BombAnimCtrl';
/**
 * 蛋糕数据
 */
const Cakes = {
    A: {
        weight: 1,
        score: -2,
        prefab: 'Res/Prefabs/Bomb',
        bombPrefab: 'Res/Prefabs/BombBomb',
        bombPoolClass: BombAnimCtrl,
        bombAudio: 'Res/Audio/Bomb',
    },
    B: {
        weight: 1,
        score: 1,
        prefab: 'Res/Prefabs/Cake1',
        bombPrefab: 'Res/Prefabs/Cake1Bomb',
        bombPoolClass: BombAnimCtrl,
        bombAudio: 'Res/Audio/Cake',
    },
    C: {
        weight: 1,
        score: 3,
        prefab: 'Res/Prefabs/Cake2',
        bombPrefab: 'Res/Prefabs/Cake2Bomb',
        bombPoolClass: BombAnimCtrl,
        bombAudio: 'Res/Audio/Cake',
    },
    D: {
        weight: 1,
        score: 5,
        prefab: 'Res/Prefabs/Cake3',
        bombPrefab: 'Res/Prefabs/Cake3Bomb',
        bombPoolClass: BombAnimCtrl,
        bombAudio: 'Res/Audio/Cake',
    },
}

export default Cakes;