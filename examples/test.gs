// ============================================================
// GoScript 地牢探险 — 一个文字 RPG 游戏
// 全面展示 GoScript 语法特性
// ============================================================

package main

import "fmt"
import "math"
import "math/rand"
import "strings"
import "time"
import "sync"
import "os"
import "bufio"

// -----------------------------------------------------------
// §11 枚举 — 角色职业与元素类型
// -----------------------------------------------------------

enum CharClass {
    Warrior
    Mage
    Rogue
    Healer
}

enum Element {
    Fire
    Ice
    Thunder
    Poison
    None
}

enum Direction {
    North
    South
    East
    West
}

// -----------------------------------------------------------
// §10 类型定义 — distinct type / 结构类型 / 联合类型
// -----------------------------------------------------------

type Gold = Int
type Damage = Int
type Health = Int

type Position = {
    x Int
    y Int
}

type GameEvent = CombatEvent | LootEvent | TrapEvent

// -----------------------------------------------------------
// §10.6 type 方法（扩展方法语法）
// -----------------------------------------------------------

fun Position.distanceTo(other Position) -> Float64 {
    val dx = Float64(x - other.x)
    val dy = Float64(y - other.y)
    return math.Sqrt(dx * dx + dy * dy)
}

fun Position.manhattanTo(other Position) -> Int {
    return math.Abs(x - other.x) + math.Abs(y - other.y)
}

// -----------------------------------------------------------
// §9 接口 — 行为契约
// -----------------------------------------------------------

interface Describable {
    describe() -> String
}

interface Combatable {
    name() -> String
    currentHP() -> Int
    takeDamage(amount Int) -> Bool
    isAlive() -> Bool
}

interface Lootable {
    lootGold() -> Gold
    lootItem() -> Item?
}

interface GameEntity -> Describable, Combatable {
    position() -> Position
}

// -----------------------------------------------------------
// §8 类 — 物品系统
// -----------------------------------------------------------

class Item(
    val id Int,
    val name String,
    val description String,
    val power Int,
    val element Element,
    val rarity String,
) {
    fun describe() -> String {
        return "【$rarity】$name ($description) [力量:$power ${elementTag()}]"
    }

    fun elementTag() -> String = when element {
        Element.Fire -> "🔥"
        Element.Ice -> "❄️"
        Element.Thunder -> "⚡"
        Element.Poison -> "☠️"
        else -> ""
    }
}

// §8.4 次构造函数
class Inventory {
    items Item[] = Item[]()
    private maxSize Int = 20

    constructor() {}

    constructor(size Int) {
        this.maxSize = size
    }

    fun add(item Item) -> Bool {
        if items.length >= maxSize {
            return false
        }
        items.push(item)
        return true
    }

    fun remove(index Int) -> Item? {
        if index < 0 || index >= items.length {
            return null
        }
        return items.splice(index, 1)[0]
    }

    fun isEmpty() -> Bool = items.length == 0

    fun isFull() -> Bool = items.length >= maxSize

    fun bestItem() -> Item? {
        if isEmpty() { return null }
        return items.maxBy { it.power }
    }

    fun totalPower() -> Int {
        return items.map { it.power }.sum()
    }

    fun display() {
        if isEmpty() {
            fmt.Println("  (背包空空如也)")
            return
        }
        for item, index in items {
            fmt.Println("  [$index] ${item.describe()}")
        }
        fmt.Println("  --- 共 ${items.length}/$maxSize 件 ---")
    }
}

// -----------------------------------------------------------
// §12 泛型 — 泛型类与函数
// -----------------------------------------------------------

class Pool<T>(
    private items T[],
) {
    fun draw() -> T? {
        if items.length == 0 { return null }
        val index = rand.Intn(items.length)
        return items[index]
    }

    fun size() -> Int = items.length

    fun filter(predicate (T) -> Bool) -> Pool<T> {
        return Pool<T>(items: items.filter(predicate))
    }
}

fun shuffle<T>(arr T[]) -> T[] {
    let result = T[](capacity: arr.length)
    for item in arr { result.push(item) }
    for let i = result.length - 1; i > 0; i-- {
        val j = rand.Intn(i + 1)
        let temp = result[i]
        result[i] = result[j]
        result[j] = temp
    }
    return result
}

fun clamp<T>(value T, low T, high T) -> T {
    return when {
        value < low -> low
        value > high -> high
        else -> value
    }
}

// -----------------------------------------------------------
// §8 类 — 角色系统（展示 init 块、嵌入、可见性）
// -----------------------------------------------------------

class Stats(
    hp Health,
    maxHP Health,
    attack Damage,
    defense Int,
    speed Int,
    luck Int,
) {
    init {
        if hp < 0 { panic("HP cannot be negative") }
        if maxHP < hp { panic("maxHP must be >= hp") }
    }

    fun healPercent(percent Float64) -> Health {
        val amount = Health(Float64(maxHP) * percent)
        hp = Health(clamp(hp + amount, 0, maxHP))
        return amount
    }
}

class Hero(
    val heroName String,
    val charClass CharClass,
    stats Stats,
    private level Int = 1,
    private exp Int = 0,
    gold Gold = Gold(0),
) {
    inventory Inventory = Inventory(size: 15)
    private killCount Int = 0
    position Position = Position(x: 0, y: 0)

    // §8.5 init 块
    init {
        fmt.Println("✦ 英雄 $heroName 踏入了地牢！职业: ${className()}")
    }

    fun className() -> String = when charClass {
        CharClass.Warrior -> "战士"
        CharClass.Mage -> "法师"
        CharClass.Rogue -> "盗贼"
        CharClass.Healer -> "治疗师"
        else -> "冒险者"
    }

    fun isAlive() -> Bool = stats.hp > 0

    fun currentHP() -> Int = stats.hp

    fun takeDamage(amount Int) -> Bool {
        val actual = Damage(math.Max(1, amount - stats.defense))
        stats.hp = Health(math.Max(0, stats.hp - actual))
        fmt.Println("  💔 $heroName 受到 $actual 点伤害 (HP: ${stats.hp}/${stats.maxHP})")
        return isAlive()
    }

    fun heal(amount Health) {
        val old = stats.hp
        stats.hp = Health(clamp(stats.hp + amount, 0, stats.maxHP))
        fmt.Println("  💚 $heroName 恢复了 ${stats.hp - old} 点生命 (HP: ${stats.hp}/${stats.maxHP})")
    }

    fun attackPower() -> Damage {
        val base = stats.attack
        val classBonus = when charClass {
            CharClass.Warrior -> Damage(5)
            CharClass.Mage -> Damage(3)
            CharClass.Rogue -> Damage(4)
            else -> Damage(2)
        }
        val weaponBonus = inventory.bestItem()?.power ?? 0
        return base + classBonus + Damage(weaponBonus / 2)
    }

    fun criticalChance() -> Float64 {
        val base = when charClass {
            CharClass.Rogue -> 0.25
            CharClass.Warrior -> 0.15
            CharClass.Mage -> 0.10
            else -> 0.05
        }
        return base + Float64(stats.luck) * 0.01
    }

    fun gainExp(amount Int) {
        exp += amount
        val needed = level * 100
        if exp >= needed {
            exp -= needed
            levelUp()
        }
    }

    fun levelUp() {
        level++
        stats.maxHP += Health(10 + rand.Intn(5))
        stats.attack += Damage(2 + rand.Intn(3))
        stats.defense += 1
        stats.speed += 1
        stats.hp = stats.maxHP
        fmt.Println("  ⬆️ $heroName 升级了！等级: $level")
        fmt.Println("    HP:${stats.maxHP} ATK:${stats.attack} DEF:${stats.defense} SPD:${stats.speed}")
    }

    fun addGold(amount Gold) {
        gold += amount
        fmt.Println("  💰 获得 $amount 金币 (总计: $gold)")
    }

    fun recordKill() { killCount++ }

    fun summary() -> String {
        return `
╔══════════════════════════════════════╗
║  英雄: $heroName ($className())
║  等级: $level  经验: $exp/${level * 100}
║  HP: ${stats.hp}/${stats.maxHP}
║  攻击: ${stats.attack}  防御: ${stats.defense}
║  速度: ${stats.speed}  幸运: ${stats.luck}
║  金币: $gold  击杀: $killCount
║  背包: ${inventory.items.length}/15 件
╚══════════════════════════════════════╝`
    }
}

// -----------------------------------------------------------
// §8 类 — 怪物系统
// -----------------------------------------------------------

class Monster(
    val monsterName String,
    private hp Health,
    val attack Damage,
    val defense Int,
    val element Element,
    val goldDrop Gold,
    val expReward Int,
    dropItem Item?,
) {
    fun name() -> String = monsterName
    fun currentHP() -> Int = hp
    fun isAlive() -> Bool = hp > 0

    fun takeDamage(amount Int) -> Bool {
        val actual = Damage(math.Max(1, amount - defense))
        hp = Health(math.Max(0, hp - actual))
        fmt.Println("  🗡️ $monsterName 受到 $actual 点伤害 (HP: $hp)")
        return isAlive()
    }

    fun describe() -> String {
        val elem = when element {
            Element.Fire -> "🔥火焰"
            Element.Ice -> "❄️冰霜"
            Element.Thunder -> "⚡雷电"
            Element.Poison -> "☠️剧毒"
            else -> "普通"
        }
        return "$monsterName [$elem] HP:$hp ATK:$attack DEF:$defense"
    }
}

// -----------------------------------------------------------
// §8 / §9 — 事件类（联合类型成员，实现接口）
// -----------------------------------------------------------

class CombatEvent(
    val monster Monster,
    val pos Position,
) {
    fun describe() -> String = "⚔️ 遭遇了 ${monster.describe()}"
}

class LootEvent(
    val item Item,
    val gold Gold,
    val pos Position,
) {
    fun describe() -> String = "🎁 发现了宝箱！${item.describe()} 和 $gold 金币"
}

class TrapEvent(
    val damage Damage,
    val trapType String,
    val pos Position,
) {
    fun describe() -> String = "⚠️ 触发了${trapType}陷阱！造成 $damage 点伤害"
}

// -----------------------------------------------------------
// §15 错误处理 — 自定义错误
// -----------------------------------------------------------

class GameOverError(val reason String) {
    fun message() -> String = "游戏结束: $reason"
}

class InvalidInputError(val input String) {
    fun message() -> String = "无效输入: $input"
}

// -----------------------------------------------------------
// §6 函数 — 工厂函数（展示默认参数、命名参数）
// -----------------------------------------------------------

fun createMonster(
    name String,
    level Int,
    element Element = Element.None,
    isBoss Bool = false,
) -> Monster {
    val multiplier = if isBoss { 3.0 } else { 1.0 }
    val hp = Health(Float64(20 + level * 10) * multiplier)
    val atk = Damage(Float64(5 + level * 3) * multiplier)
    val def = Int(Float64(2 + level) * multiplier)
    val gold = Gold(Float64(10 + level * 5) * multiplier)
    val exp = Int(Float64(15 + level * 8) * multiplier)
    val item Item? = if rand.Float64() < 0.3 {
        createRandomItem(level)
    } else {
        null
    }
    return Monster(
        monsterName: name,
        hp: hp,
        attack: atk,
        defense: def,
        element: element,
        goldDrop: gold,
        expReward: exp,
        dropItem: item,
    )
}

fun createRandomItem(level Int) -> Item {
    val names = ["锈蚀短剑", "魔法权杖", "暗影匕首", "祝福之盾",
                 "龙鳞铠甲", "凤凰之羽", "雷神之锤", "冰霜法杖"]
    val elements = [Element.Fire, Element.Ice, Element.Thunder, Element.Poison, Element.None]
    val rarities = ["普通", "精良", "稀有", "史诗", "传说"]

    val rarityRoll = rand.Float64()
    val rarityIndex = when {
        rarityRoll < 0.40 -> 0
        rarityRoll < 0.70 -> 1
        rarityRoll < 0.88 -> 2
        rarityRoll < 0.97 -> 3
        else -> 4
    }

    val power = (level * 3 + rand.Intn(10)) * (rarityIndex + 1)

    return Item(
        id: rand.Intn(10000),
        name: names[rand.Intn(names.length)],
        description: "等级 $level 的装备",
        power: power,
        element: elements[rand.Intn(elements.length)],
        rarity: rarities[rarityIndex],
    )
}

// -----------------------------------------------------------
// §6.2 单表达式函数
// -----------------------------------------------------------

fun elementAdvantage(attacker Element, defender Element) -> Float64 = when {
    attacker == Element.Fire && defender == Element.Ice -> 1.5
    attacker == Element.Ice && defender == Element.Thunder -> 1.5
    attacker == Element.Thunder && defender == Element.Fire -> 1.5
    attacker == Element.Poison && defender == Element.None -> 1.3
    attacker == defender && attacker != Element.None -> 0.7
    else -> 1.0
}

fun rollDice(sides Int) -> Int = rand.Intn(sides) + 1

fun formatBar(current Int, max Int, width Int = 20) -> String {
    val filled = Int(Float64(current) / Float64(max) * Float64(width))
    val empty = width - filled
    return "[${strings.Repeat("█", filled)}${strings.Repeat("░", empty)}] $current/$max"
}

// -----------------------------------------------------------
// §13 集合类型 — Map / Set 操作
// -----------------------------------------------------------

fun buildMonsterPool(dungeonLevel Int) -> Pool<Monster> {
    let monsters = Monster[]()

    val monsterTable = #{
        "史莱姆": Element.None,
        "火焰蜥蜴": Element.Fire,
        "冰霜巨人": Element.Ice,
        "雷电精灵": Element.Thunder,
        "毒蛇女王": Element.Poison,
        "暗影骑士": Element.None,
        "熔岩魔像": Element.Fire,
        "寒冰幽灵": Element.Ice,
    }

    for element, name in monsterTable {
        val level = dungeonLevel + rand.Intn(3) - 1
        monsters.push(createMonster(
            name: name,
            level: math.Max(1, level),
            element: element,
        ))
    }

    return Pool<Monster>(items: monsters)
}

fun buildBossPool() -> Pool<Monster> {
    val bosses = [
        createMonster(name: "远古巨龙", level: 10, element: Element.Fire, isBoss: true),
        createMonster(name: "虚空领主", level: 10, element: Element.Thunder, isBoss: true),
        createMonster(name: "冰霜女王", level: 10, element: Element.Ice, isBoss: true),
    ]
    return Pool<Monster>(items: bosses)
}

// -----------------------------------------------------------
// §14 空值安全 — 完整演示
// -----------------------------------------------------------

fun findBestWeaponName(hero Hero) -> String {
    // §14.2 可选链 + §14.3 空值合并
    return hero.inventory.bestItem()?.name ?? "赤手空拳"
}

fun tryEquipItem(hero Hero, item Item?) -> String {
    // §14.4 非空断言（仅在确定不为 null 时使用）
    if item == null {
        return "没有可装备的物品"
    }
    val success = hero.inventory.add(item!)
    return if success {
        "装备了 ${item!.name}"
    } else {
        "背包已满，无法装备"
    }
}

// -----------------------------------------------------------
// §16 模式匹配 — 处理游戏事件
// -----------------------------------------------------------

fun processEvent(event GameEvent, hero Hero) {
    // §16.1 when + is 智能转型
    when event {
        is CombatEvent -> {
            fmt.Println("\n${event.describe()}")
            executeCombat(hero, event.monster)
        }
        is LootEvent -> {
            fmt.Println("\n${event.describe()}")
            hero.addGold(event.gold)
            val msg = tryEquipItem(hero, event.item)
            fmt.Println("  $msg")
        }
        is TrapEvent -> {
            fmt.Println("\n${event.describe()}")
            hero.takeDamage(event.damage)
        }
    }
}

// -----------------------------------------------------------
// 战斗系统 — 综合运用多种语法特性
// -----------------------------------------------------------

fun executeCombat(hero Hero, monster Monster) {
    fmt.Println("━━━ 战斗开始 ━━━")
    fmt.Println("  ${hero.heroName} vs ${monster.monsterName}")
    fmt.Println("  $heroName HP: ${formatBar(hero.currentHP(), hero.stats.maxHP)}")
    fmt.Println("  ${monster.monsterName} HP: ${formatBar(monster.currentHP(), monster.hp)}")

    let round = 1
    for hero.isAlive() && monster.isAlive() {
        fmt.Println("\n--- 第 $round 回合 ---")

        // 英雄攻击
        let dmg = hero.attackPower()
        val crit = rand.Float64() < hero.criticalChance()
        if crit {
            dmg = Damage(Float64(dmg) * 1.8)
            fmt.Println("  ✨ 暴击！")
        }

        val elemBonus = elementAdvantage(
            hero.inventory.bestItem()?.element ?? Element.None,
            monster.element,
        )
        dmg = Damage(Float64(dmg) * elemBonus)

        if elemBonus > 1.0 {
            fmt.Println("  🎯 属性克制！伤害提升 ${Int((elemBonus - 1.0) * 100)}%")
        }

        monster.takeDamage(dmg)

        if !monster.isAlive() {
            fmt.Println("\n  🏆 $heroName 击败了 ${monster.monsterName}！")
            hero.recordKill()
            hero.gainExp(monster.expReward)
            hero.addGold(monster.goldDrop)

            // §14 空值安全 — 怪物掉落
            if monster.dropItem != null {
                val drop = monster.dropItem!
                fmt.Println("  🎁 掉落了: ${drop.describe()}")
                hero.inventory.add(drop)
            }
            break
        }

        // 怪物反击
        let monsterDmg = monster.attack + Damage(rollDice(4))
        hero.takeDamage(monsterDmg)

        if !hero.isAlive() {
            fmt.Println("\n  ☠️ $heroName 倒下了……")
            break
        }

        round++
    }

    fmt.Println("━━━ 战斗结束 ━━━\n")
}

// -----------------------------------------------------------
// §8.6 嵌入（组合） — 地牢房间
// -----------------------------------------------------------

class Room(
    val pos Position,
    val description String,
    explored Bool = false,
    val events GameEvent[],
    exits Map<String, Position>,
) {
    fun enter(hero Hero) {
        explored = true
        fmt.Println("\n════════════════════════════════")
        fmt.Println("📍 位置: (${pos.x}, ${pos.y})")
        fmt.Println("   $description")
        fmt.Println("════════════════════════════════")

        for event in events {
            processEvent(event, hero)
            if !hero.isAlive() { return }
        }
    }

    fun showExits() {
        fmt.Println("  出口:")
        for pos, dir in exits {
            fmt.Println("    $dir -> (${pos.x}, ${pos.y})")
        }
    }
}

// -----------------------------------------------------------
// §12 泛型 + §7 闭包 — 地牢生成器
// -----------------------------------------------------------

class DungeonGenerator(
    val width Int,
    val height Int,
    val dungeonLevel Int,
) {
    fun generate() -> Map<String, Room> {
        let rooms = Map<String, Room>()
        let monsterPool = buildMonsterPool(dungeonLevel)

        val descriptions = [
            "昏暗的走廊，墙壁上爬满了青苔",
            "宽阔的大厅，中央有一座破碎的喷泉",
            "狭窄的通道，弥漫着硫磺的气味",
            "藏书室的废墟，古老的典籍散落一地",
            "地下河畔，水声潺潺",
            "祭坛遗迹，空气中残留着魔力",
            "铁匠铺残骸，炉火早已熄灭",
            "牢房区域，锈蚀的铁栏诉说着往事",
        ]

        for let y = 0; y < height; y++ {
            for let x = 0; x < width; x++ {
                val pos = Position(x: x, y: y)
                val key = "$x,$y"

                let events = GameEvent[]()
                val roll = rand.Float64()

                // §5.3 when 无参数形式 — 条件分支
                when {
                    roll < 0.50 -> {
                        val m = monsterPool.draw()
                        if m != null {
                            events.push(CombatEvent(
                                monster: m!,
                                pos: pos,
                            ))
                        }
                    }
                    roll < 0.70 -> {
                        events.push(LootEvent(
                            item: createRandomItem(dungeonLevel),
                            gold: Gold(rand.Intn(50) + 10),
                            pos: pos,
                        ))
                    }
                    roll < 0.85 -> {
                        val trapTypes = ["毒针", "落石", "火焰喷射", "地刺"]
                        events.push(TrapEvent(
                            damage: Damage(5 + rand.Intn(15)),
                            trapType: trapTypes[rand.Intn(trapTypes.length)],
                            pos: pos,
                        ))
                    }
                    else -> {}
                }

                let exits = Map<String, Position>()
                if x > 0 { exits["west"] = Position(x: x - 1, y: y) }
                if x < width - 1 { exits["east"] = Position(x: x + 1, y: y) }
                if y > 0 { exits["north"] = Position(x: x, y: y - 1) }
                if y < height - 1 { exits["south"] = Position(x: x, y: y + 1) }

                rooms[key] = Room(
                    pos: pos,
                    description: descriptions[rand.Intn(descriptions.length)],
                    events: events,
                    exits: exits,
                )
            }
        }

        return rooms
    }
}

// -----------------------------------------------------------
// §17 并发 — 后台日志与统计
// -----------------------------------------------------------

class GameLogger {
    private logs String[] = String[]()
    private mu sync.Mutex = sync.Mutex()

    fun log(message String) {
        mu.Lock()
        defer { mu.Unlock() }
        val timestamp = time.Now().Format("15:04:05")
        logs.push("[$timestamp] $message")
    }

    fun dump() {
        mu.Lock()
        defer { mu.Unlock() }
        fmt.Println("\n📜 冒险日志:")
        for entry in logs {
            fmt.Println("  $entry")
        }
    }
}

fun startBackgroundTimer(ch chan<String>, seconds Int) {
    go {
        for let i = seconds; i > 0; i-- {
            time.Sleep(time.Second)
        }
        ch <- "time_up"
    }
}

// -----------------------------------------------------------
// §21 扩展方法 — 为已有类型添加功能
// -----------------------------------------------------------

fun Hero.showStatus() {
    fmt.Println(summary())
    fmt.Println("  🗡️ 攻击力: ${attackPower()} | 暴击率: ${Int(criticalChance() * 100)}%")
    fmt.Println("  🎒 最强装备: ${findBestWeaponName(this)}")
}

fun Hero.rest() {
    val amount = stats.healPercent(0.3)
    fmt.Println("  😴 $heroName 休息了一会儿，恢复了 $amount 点生命")
}

fun Monster.enrage() {
    fmt.Println("  😡 ${monsterName} 进入了狂暴状态！")
}

// -----------------------------------------------------------
// §19 解构赋值
// -----------------------------------------------------------

fun parseCommand(input String) -> (String, String) {
    val parts = input.trim().lowercase().split(" ")
    if parts.length == 0 {
        return ("", "")
    }
    if parts.length == 1 {
        return (parts[0], "")
    }
    return (parts[0], parts[1])
}

// -----------------------------------------------------------
// §7 闭包与 Lambda — 高阶函数实战
// -----------------------------------------------------------

fun applyBuffs(hero Hero, buffs ((Hero) -> ())[] ) {
    for buff in buffs {
        buff(hero)
    }
}

val strengthBuff = { hero Hero ->
    hero.stats.attack += Damage(3)
    fmt.Println("  💪 力量增益！攻击 +3")
}

val speedBuff = { hero Hero ->
    hero.stats.speed += 2
    fmt.Println("  🌪️ 速度增益！速度 +2")
}

val luckBuff = { hero Hero ->
    hero.stats.luck += 5
    fmt.Println("  🍀 幸运增益！幸运 +5")
}

// -----------------------------------------------------------
// §7.4 方法链 — 数据处理
// -----------------------------------------------------------

fun generateLeaderboard(heroes Hero[]) -> String {
    return heroes
        .filter { it.isAlive() }
        .sortBy { -it.gold }
        .map { hero, index -> "${index + 1}. ${hero.heroName} — 金币:${hero.gold}" }
        .join("\n")
}

// -----------------------------------------------------------
// §15 错误处理
// -----------------------------------------------------------

fun loadDungeonConfig(path String) -> Map<String, String> {
    let file = os.Open(path) catch { err ->
        fmt.Println("  ⚠️ 配置文件不存在，使用默认设置")
        return #{
            "width": "4",
            "height": "4",
            "difficulty": "normal",
        }
    }
    defer { file.Close() }

    let config = Map<String, String>()
    let scanner = bufio.NewScanner(file)
    for scanner.Scan() {
        val line = scanner.Text()
        val parts = line.split("=")
        if parts.length == 2 {
            config[parts[0].trim()] = parts[1].trim()
        }
    }
    return config
}

fun validateHeroName(name String) -> String {
    if name.trim().length == 0 {
        throw InvalidInputError(input: "名字不能为空")
    }
    if name.length > 20 {
        throw InvalidInputError(input: "名字不能超过20个字符")
    }
    return name.trim()
}

// -----------------------------------------------------------
// 主游戏循环
// -----------------------------------------------------------

fun selectClass(choice String) -> CharClass {
    return when choice {
        "1" -> CharClass.Warrior
        "2" -> CharClass.Mage
        "3" -> CharClass.Rogue
        "4" -> CharClass.Healer
        else -> CharClass.Warrior
    }
}

fun createHero(name String, classChoice String) -> Hero {
    val charClass = selectClass(classChoice)

    // §5.3 when 表达式 — 根据职业设定不同初始属性
    val (hp, atk, def, spd, lck) = when charClass {
        CharClass.Warrior -> (120, 15, 8, 5, 3)
        CharClass.Mage -> (80, 20, 3, 7, 5)
        CharClass.Rogue -> (90, 12, 5, 12, 10)
        CharClass.Healer -> (100, 8, 6, 6, 8)
        else -> (100, 10, 5, 5, 5)
    }

    return Hero(
        heroName: name,
        charClass: charClass,
        stats: Stats(
            hp: Health(hp),
            maxHP: Health(hp),
            attack: Damage(atk),
            defense: def,
            speed: spd,
            luck: lck,
        ),
    )
}

fun printBanner() {
    fmt.Println(`
╔══════════════════════════════════════════════════╗
║                                                  ║
║          ⚔️  GoScript 地牢探险  ⚔️               ║
║                                                  ║
║   一个用 GoScript 编写的文字 RPG 游戏            ║
║   全面展示这门优美语言的语法特性                 ║
║                                                  ║
╚══════════════════════════════════════════════════╝
    `)
}

fun printHelp() {
    fmt.Println(`
  命令列表:
    north/south/east/west — 移动
    status    — 查看状态
    bag       — 查看背包
    rest      — 休息回复
    exits     — 查看出口
    help      — 帮助
    quit      — 退出
    `)
}

// -----------------------------------------------------------
// §6.5 可变参数
// -----------------------------------------------------------

fun announce(messages ...String) {
    fmt.Println("┌─────────────────────────────────┐")
    for msg in messages {
        fmt.Println("│ $msg")
    }
    fmt.Println("└─────────────────────────────────┘")
}

// -----------------------------------------------------------
// §9.4 匿名实现
// -----------------------------------------------------------

val narrator = object Describable {
    fun describe() -> String = "一位神秘的旁白者注视着这片地牢……"
}

// -----------------------------------------------------------
// 主函数 — 游戏入口
// -----------------------------------------------------------

fun main() {
    rand.Seed(time.Now().UnixNano())
    printBanner()

    val logger = GameLogger()
    logger.log("游戏启动")

    // 选择角色
    announce("欢迎来到地牢探险！", "请选择你的职业:")
    fmt.Println("  1. ⚔️ 战士 — 高血量，高防御")
    fmt.Println("  2. 🔮 法师 — 高攻击，低防御")
    fmt.Println("  3. 🗡️ 盗贼 — 高速度，高暴击")
    fmt.Println("  4. 💚 治疗师 — 均衡属性，高幸运")

    val reader = bufio.NewReader(os.Stdin)

    fmt.Print("\n  选择职业 (1-4): ")
    val classInput = reader.ReadString('\n') catch { err ->
        "1"
    }

    fmt.Print("  输入英雄名字: ")
    val nameInput = reader.ReadString('\n') catch { err ->
        "无名英雄"
    }

    val heroName = validateHeroName(nameInput) catch { err ->
        fmt.Println("  ${err.message()}, 使用默认名字")
        "无名英雄"
    }

    let hero = createHero(heroName, classInput.trim())
    logger.log("创建英雄: ${hero.heroName} (${hero.className()})")

    // 初始装备
    val starterItem = createRandomItem(1)
    hero.inventory.add(starterItem)
    fmt.Println("\n  🎁 获得初始装备: ${starterItem.describe()}")

    // §7 Lambda — 应用初始增益
    val initialBuffs = when hero.charClass {
        CharClass.Warrior -> [strengthBuff]
        CharClass.Rogue -> [speedBuff, luckBuff]
        CharClass.Mage -> [strengthBuff]
        CharClass.Healer -> [luckBuff]
        else -> [strengthBuff]
    }
    applyBuffs(hero, initialBuffs)

    // 生成地牢
    val config = loadDungeonConfig("dungeon.conf")
    val dungeonWidth = 4
    val dungeonHeight = 4
    val generator = DungeonGenerator(
        width: dungeonWidth,
        height: dungeonHeight,
        dungeonLevel: 1,
    )
    let rooms = generator.generate()

    // §17 并发 — 启动后台计时器
    let timerCh = chan<String>(1)
    startBackgroundTimer(timerCh, 600)

    fmt.Println("\n${narrator.describe()}")
    fmt.Println("  地牢大小: ${dungeonWidth}x${dungeonHeight}")
    printHelp()

    // 进入起始房间
    val startKey = "${hero.position.x},${hero.position.y}"
    val startRoom = rooms[startKey]
    if startRoom != null {
        startRoom!.enter(hero)
    }

    // §5.2 for 条件循环 — 主循环
    let gameRunning = true
    for gameRunning && hero.isAlive() {
        fmt.Print("\n> ")
        val input = reader.ReadString('\n') catch { err ->
            continue
        }

        // §19 解构赋值
        let (cmd, arg) = parseCommand(input)

        logger.log("执行命令: $cmd")

        // §5.3 when — 命令分发
        when cmd {
            "north", "south", "east", "west" -> {
                val currentKey = "${hero.position.x},${hero.position.y}"
                val currentRoom = rooms[currentKey]
                if currentRoom == null {
                    fmt.Println("  ❌ 当前位置异常")
                    continue
                }

                val nextPos = currentRoom!.exits[cmd]
                if nextPos == null {
                    fmt.Println("  🚫 这个方向没有出口")
                    continue
                }

                hero.position = nextPos!
                val nextKey = "${nextPos!.x},${nextPos!.y}"
                val nextRoom = rooms[nextKey]
                if nextRoom != null {
                    nextRoom!.enter(hero)
                }
            }
            "status" -> hero.showStatus()
            "bag" -> {
                fmt.Println("\n🎒 背包:")
                hero.inventory.display()
            }
            "rest" -> hero.rest()
            "exits" -> {
                val key = "${hero.position.x},${hero.position.y}"
                val room = rooms[key]
                room?.showExits() ?? fmt.Println("  ❌ 位置异常")
            }
            "help" -> printHelp()
            "quit", "exit" -> {
                gameRunning = false
                fmt.Println("\n  👋 冒险者离开了地牢……")
            }
            "log" -> logger.dump()
            else -> {
                if cmd.length > 0 {
                    fmt.Println("  ❓ 未知命令: $cmd (输入 help 查看帮助)")
                }
            }
        }

        // §17 并发 — 检查计时器 (非阻塞 select)
        select {
            <-timerCh -> {
                val v = <-timerCh
                fmt.Println("\n⏰ 地牢开始崩塌！冒险结束！")
                gameRunning = false
            }
            else -> {}
        }
    }

    // 游戏结束
    fmt.Println("\n══════════════════════════════════")
    fmt.Println("        ⚔️ 冒险结束 ⚔️")
    fmt.Println("══════════════════════════════════")
    hero.showStatus()
    logger.log("游戏结束")
    logger.dump()

    // §7.4 方法链 — 最终统计
    val powerItems = hero.inventory.items
        .filter { it.power > 10 }
        .sortBy { -it.power }
        .map { "  ✦ ${it.name} (力量:${it.power})" }
        .join("\n")

    if powerItems.length > 0 {
        fmt.Println("\n🏅 强力装备:")
        fmt.Println(powerItems)
    }

    fmt.Println("\n感谢游玩 GoScript 地牢探险！")
}
