import { Asset } from "expo-asset";
import { File } from "expo-file-system"; // 新版 API

const dictAssets: Record<string, any> = {
    a: require("../assets/dict/a.txt"),
    b: require("../assets/dict/b.txt"),
    c: require("../assets/dict/c.txt"),
    d: require("../assets/dict/d.txt"),
    e: require("../assets/dict/e.txt"),
    f: require("../assets/dict/f.txt"),
    g: require("../assets/dict/g.txt"),
    h: require("../assets/dict/h.txt"),
    i: require("../assets/dict/i.txt"),
    j: require("../assets/dict/j.txt"),
    k: require("../assets/dict/k.txt"),
    l: require("../assets/dict/l.txt"),
    m: require("../assets/dict/m.txt"),
    n: require("../assets/dict/n.txt"),
    o: require("../assets/dict/o.txt"),
    p: require("../assets/dict/p.txt"),
    q: require("../assets/dict/q.txt"),
    r: require("../assets/dict/r.txt"),
    s: require("../assets/dict/s.txt"),
    t: require("../assets/dict/t.txt"),
    u: require("../assets/dict/u.txt"),
    v: require("../assets/dict/v.txt"),
    w: require("../assets/dict/w.txt"),
    x: require("../assets/dict/x.txt"),
    y: require("../assets/dict/y.txt"),
    z: require("../assets/dict/z.txt"),
};

export async function loadDict(letter: string): Promise<string[]> {
    const asset = Asset.fromModule(dictAssets[letter]);
    await asset.downloadAsync();
    const content = new File(asset.localUri!).text();
    return (await content).split("\n").filter(Boolean);
}