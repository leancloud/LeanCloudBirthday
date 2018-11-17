import BombAnimCtrl from './BombAnimCtrl';
/**
 * 蛋糕数据
 */
const Cakes = {
    A: {
        weight: 1,
        score: -2,
        prefab: 'Prefabs/Bomb',
        bombPrefab: 'Prefabs/BombBomb',
        bombPoolClass: BombAnimCtrl,
    },
    B: {
        weight: 1,
        score: 1,
        prefab: 'Prefabs/Cake1',
        bombPrefab: 'Prefabs/Cake1Bomb',
        bombPoolClass: BombAnimCtrl,
    },
    C: {
        weight: 1,
        score: 3,
        prefab: 'Prefabs/Cake2',
        bombPrefab: 'Prefabs/Cake2Bomb',
        bombPoolClass: BombAnimCtrl,
    },
    D: {
        weight: 1,
        score: 5,
        prefab: 'Prefabs/Cake3',
        bombPrefab: 'Prefabs/Cake3Bomb',
        bombPoolClass: BombAnimCtrl,
    },
}

export default Cakes;