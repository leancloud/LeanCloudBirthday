import BombAnimCtrl from './BombAnimCtrl';
/**
 * 蛋糕数据
 */
const Cakes = {
    BOMB: {
        weight: 1,
        score: -2,
        prefab: 'Prefabs/Bomb',
        bombPrefab: 'Prefabs/BombBomb',
        bombPoolClass: BombAnimCtrl,
    },
    CAKE1: {
        weight: 1,
        score: 1,
        prefab: 'Prefabs/Cake1',
        bombPrefab: 'Prefabs/Cake1Bomb',
        bombPoolClass: BombAnimCtrl,
    },
    CAKE2: {
        weight: 1,
        score: 3,
        prefab: 'Prefabs/Cake2',
        bombPrefab: 'Prefabs/Cake2Bomb',
        bombPoolClass: BombAnimCtrl,
    },
    CAKE3: {
        weight: 1,
        score: 5,
        prefab: 'Prefabs/Cake3',
        bombPrefab: 'Prefabs/Cake3Bomb',
        bombPoolClass: BombAnimCtrl,
    },
}

export default Cakes;