
import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Sprout, Plus, Check, Droplets, Flame, Leaf, Sun, Trash2,
  CalendarDays, Sparkles, ShoppingBag, RotateCcw, X, BarChart3,
  Trophy, PawPrint, Snowflake, CloudSun, Flower2, Heart, Settings,
  LockKeyhole, ChevronRight
} from "lucide-react";
import "./style.css";

const STORAGE_KEY = "little-wins-garden";

const starterHabits = [
  { id: "water", name: "Drink some water", emoji: "💧", done: [] },
  { id: "read", name: "Read a little", emoji: "📚", done: [] },
  { id: "move", name: "Move your body", emoji: "🧘", done: [] },
];

const shopItems = [
  { id: "rose", name: "Rose", emoji: "🌹", category: "flower", price: 5 },
  { id: "daisy", name: "Daisy", emoji: "🌼", category: "flower", price: 4 },
  { id: "tulip", name: "Tulip", emoji: "🌷", category: "flower", price: 5 },
  { id: "sunflower", name: "Sunflower", emoji: "🌻", category: "flower", price: 6 },
  { id: "mushroom", name: "Mushroom", emoji: "🍄", category: "nature", price: 7 },
  { id: "stone", name: "Garden stone", emoji: "🪨", category: "decor", price: 3 },
  { id: "fence", name: "Fence", emoji: "🪵", category: "decor", price: 4 },
  { id: "path", name: "Garden path", emoji: "🪴", category: "decor", price: 6 },
];

const companions = [
  { id: "bunny", name: "Bunny", emoji: "🐰", greeting: "You are growing beautifully!" },
  { id: "frog", name: "Froggy", emoji: "🐸", greeting: "Little steps make a big splash!" },
  { id: "cat", name: "Kitty", emoji: "🐱", greeting: "A cozy day, one win at a time." },
  { id: "bee", name: "Bumble", emoji: "🐝", greeting: "Buzzing with pride in you!" },
];

const seasons = {
  spring: {
    label: "Spring", emoji: "🌸", description: "Fresh starts and tiny blossoms",
    sky: "spring", flowers: ["🌸", "🌷", "🦋"], ground: "🌱",
  },
  summer: {
    label: "Summer", emoji: "☀️", description: "Sunny days and flourishing blooms",
    sky: "summer", flowers: ["🌻", "🌺", "🦋"], ground: "🌿",
  },
  autumn: {
    label: "Autumn", emoji: "🍂", description: "Cozy colors and gentle change",
    sky: "autumn", flowers: ["🍁", "🍄", "🌾"], ground: "🍂",
  },
  winter: {
    label: "Winter", emoji: "❄️", description: "A quiet season to rest and reset",
    sky: "winter", flowers: ["❄️", "⛄", "✨"], ground: "🌲",
  },
};

const weatherOptions = [
  { id: "sunny", label: "Sunny", emoji: "☀️", description: "Warm sunshine and tiny sparkles" },
  { id: "rainy", label: "Rainy", emoji: "🌧️", description: "Gentle rain for your flowers" },
  { id: "autumn", label: "Falling leaves", emoji: "🍂", description: "Cozy leaves drifting by" },
  { id: "snowy", label: "Snowy", emoji: "❄️", description: "A soft winter wonderland" },
  { id: "rainbow", label: "Rainbow", emoji: "🌈", description: "A little colorful magic" },
];

const themeOptions = [
  { id: "rose", label: "Rose Garden", emoji: "🌷", description: "Soft pink and peach" },
  { id: "lavender", label: "Lavender Dream", emoji: "🪻", description: "Dreamy purple and lilac" },
  { id: "mint", label: "Mint Meadow", emoji: "🌿", description: "Fresh mint and sage" },
  { id: "sunset", label: "Peach Sunset", emoji: "🌅", description: "Warm peach and golden hues" },
];

const badgesList = [
  { id: "first-win", name: "First Little Win", emoji: "🌱", description: "Complete your first habit.", test: (s) => s.totalCompletions >= 1 },
  { id: "five-wins", name: "Growing Strong", emoji: "🌿", description: "Complete 5 habits in total.", test: (s) => s.totalCompletions >= 5 },
  { id: "ten-wins", name: "Blooming", emoji: "🌷", description: "Complete 10 habits in total.", test: (s) => s.totalCompletions >= 10 },
  { id: "week-wins", name: "A Whole Week", emoji: "🌈", description: "Complete a habit on 7 different days.", test: (s) => s.activeDays >= 7 },
  { id: "garden-grower", name: "Garden Grower", emoji: "🪴", description: "Own 5 garden decorations.", test: (s) => s.ownedItems >= 5 },
  { id: "quest-star", name: "Quest Star", emoji: "⭐", description: "Claim 5 daily quests.", test: (s) => s.questsClaimed >= 5 },
  { id: "season-hopper", name: "Season Explorer", emoji: "🦋", description: "Try all four seasons.", test: (s) => s.seasonsVisited >= 4 },
  { id: "best-buddy", name: "Best Buddies", emoji: "💛", description: "Choose your garden companion.", test: (s) => Boolean(s.companion) },
];

function localDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getSeasonFromDate(date = new Date()) {
  const month = date.getMonth();
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "autumn";
  return "winter";
}

function readSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        habits: starterHabits,
        spentDrops: 0,
        bonusDrops: 0,
        inventory: [],
        claimedQuests: [],
        companion: "bunny",
        season: getSeasonFromDate(),
        autoSeason: true,
        seasonsVisited: [],
        weather: "sunny",
        theme: "rose",
      };
    }

    const old = JSON.parse(raw);
    const inventory = Array.isArray(old.inventory) ? old.inventory.map((item, index) => ({
      ...item,
      instanceId: item.instanceId || `${item.itemId || item.id || "item"}-${index}`,
      itemId: item.itemId || item.id || "unknown",
      name: item.name || "Garden decoration",
      emoji: item.emoji || "🌼",
      category: item.category || "decor",
      x: Number.isFinite(item.x) ? item.x : 25 + (index * 13) % 55,
      y: Number.isFinite(item.y) ? item.y : 60 + (index * 7) % 25,
      placed: Boolean(item.placed),
    })) : [];

    return {
      ...old,
      habits: Array.isArray(old.habits) ? old.habits.map((habit) => ({
        ...habit,
        done: Array.isArray(habit.done) ? habit.done : [],
      })) : starterHabits,
      spentDrops: Number(old.spentDrops) || 0,
      bonusDrops: Number(old.bonusDrops) || 0,
      inventory,
      claimedQuests: Array.isArray(old.claimedQuests) ? old.claimedQuests : [],
      companion: old.companion || "bunny",
      season: seasons[old.season] ? old.season : getSeasonFromDate(),
      autoSeason: old.autoSeason !== false,
      seasonsVisited: Array.isArray(old.seasonsVisited) ? old.seasonsVisited : [],
      weather: ["sunny", "rainy", "autumn", "snowy", "rainbow"].includes(old.weather) ? old.weather : "sunny",
      theme: ["rose", "lavender", "mint", "sunset"].includes(old.theme) ? old.theme : "rose",
    };
  } catch (error) {
    console.error("Could not load garden save:", error);
    return {
      habits: starterHabits,
      spentDrops: 0,
      bonusDrops: 0,
      inventory: [],
      claimedQuests: [],
      companion: "bunny",
      season: getSeasonFromDate(),
      autoSeason: true,
      seasonsVisited: [],
    };
  }
}

function App() {
  const [saved, setSaved] = useState(readSavedState);
  const [activeTab, setActiveTab] = useState("garden");
  const [newHabit, setNewHabit] = useState("");
  const [newEmoji, setNewEmoji] = useState("🌱");
  const [selectedId, setSelectedId] = useState(null);
  const [message, setMessage] = useState("");
  const [draggingId, setDraggingId] = useState(null);

  const today = localDate();
  const season = saved.autoSeason ? getSeasonFromDate() : saved.season;
  const seasonInfo = seasons[season] || seasons.spring;
  const companion = companions.find((item) => item.id === saved.companion) || companions[0];

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }, [saved]);

  useEffect(() => {
    if (saved.autoSeason && saved.season !== getSeasonFromDate()) {
      setSaved((previous) => ({
        ...previous,
        season: getSeasonFromDate(),
        seasonsVisited: [...new Set([...(previous.seasonsVisited || []), getSeasonFromDate()])],
      }));
    }
  }, [saved.autoSeason, saved.season]);

  const completedToday = saved.habits.filter((habit) => habit.done.includes(today)).length;
  const totalHabits = saved.habits.length;
  const todayPercent = totalHabits ? Math.round((completedToday / totalHabits) * 100) : 0;
  const totalCompletions = saved.habits.reduce((sum, habit) => sum + habit.done.length, 0);
  const activeDays = new Set(saved.habits.flatMap((habit) => habit.done)).size;
  const water = totalCompletions;
  const availableDrops = Math.max(0, water + saved.bonusDrops - saved.spentDrops);
  const placedItems = saved.inventory.filter((item) => item.placed);
  const collectedItems = saved.inventory.filter((item) => !item.placed);
  const questsClaimed = saved.claimedQuests.length;

  const streak = useMemo(() => {
    let count = 0;
    const date = new Date();
    while (true) {
      const key = localDate(date);
      const hasDone = saved.habits.some((habit) => habit.done.includes(key));
      if (!hasDone) break;
      count += 1;
      date.setDate(date.getDate() - 1);
    }
    return count;
  }, [saved.habits, today]);

  const questList = useMemo(() => {
    const count = saved.habits.length;
    const quests = [
      { id: "quest-one", title: "Wake a little flower", description: "Complete one habit today.", emoji: "🌼", target: 1, reward: 3 },
    ];
    if (count >= 2) {
      quests.push({ id: "quest-two", title: "A pair of petals", description: "Complete two habits today.", emoji: "🌷", target: 2, reward: 4 });
    }
    quests.push({
      id: "quest-all",
      title: "Garden in bloom",
      description: count ? "Complete every habit you have today." : "Add a habit to start growing your garden.",
      emoji: "🌻",
      target: count,
      reward: 5,
    });
    return quests;
  }, [saved.habits.length]);

  function updateHabit(habitId) {
    setSaved((previous) => ({
      ...previous,
      habits: previous.habits.map((habit) => {
        if (habit.id !== habitId) return habit;
        const done = habit.done.includes(today)
          ? habit.done.filter((date) => date !== today)
          : [...habit.done, today];
        return { ...habit, done };
      }),
    }));
  }

  function addHabit(event) {
    event.preventDefault();
    if (!newHabit.trim()) return;
    setSaved((previous) => ({
      ...previous,
      habits: [...previous.habits, {
        id: `habit-${Date.now()}`,
        name: newHabit.trim(),
        emoji: newEmoji,
        done: [],
      }],
    }));
    setNewHabit("");
    setMessage("A new little habit has been planted! 🌱");
  }

  function deleteHabit(id) {
    setSaved((previous) => ({
      ...previous,
      habits: previous.habits.filter((habit) => habit.id !== id),
    }));
  }

  function buyItem(item) {
    if (availableDrops < item.price) {
      setMessage("Not quite enough water drops yet. Keep growing! 💧");
      return;
    }
    setSaved((previous) => ({
      ...previous,
      spentDrops: previous.spentDrops + item.price,
      inventory: [...previous.inventory, {
        instanceId: `${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        itemId: item.id,
        name: item.name,
        emoji: item.emoji,
        category: item.category,
        x: 22 + Math.random() * 56,
        y: 57 + Math.random() * 28,
        placed: false,
      }],
    }));
    setMessage(`${item.name} added to your collection!`);
  }

  function placeItem(instanceId, x = 50, y = 70) {
    setSaved((previous) => ({
      ...previous,
      inventory: previous.inventory.map((item) =>
        item.instanceId === instanceId
          ? { ...item, placed: true, x, y }
          : item
      ),
    }));
    setSelectedId(null);
  }

  function returnItem(instanceId) {
    setSaved((previous) => ({
      ...previous,
      inventory: previous.inventory.map((item) =>
        item.instanceId === instanceId ? { ...item, placed: false } : item
      ),
    }));
  }

  function claimQuest(quest) {
    const claimId = `${today}:${quest.id}`;
    if (saved.claimedQuests.includes(claimId)) return;
    const progress = quest.id === "quest-one"
      ? completedToday
      : quest.id === "quest-two"
        ? completedToday
        : completedToday;
    if (progress < quest.target || quest.target === 0) return;

    setSaved((previous) => ({
      ...previous,
      bonusDrops: previous.bonusDrops + quest.reward,
      claimedQuests: [...previous.claimedQuests, claimId],
    }));
    setMessage(`Quest complete! +${quest.reward} bonus water drops 💧`);
  }

  function changeSeason(nextSeason, automatic = false) {
    setSaved((previous) => ({
      ...previous,
      season: nextSeason,
      autoSeason: automatic,
      seasonsVisited: [...new Set([...(previous.seasonsVisited || []), nextSeason])],
    }));
    setMessage(`${seasons[nextSeason].label} has arrived in your garden! ${seasons[nextSeason].emoji}`);
  }

  function chooseCompanion(id) {
    setSaved((previous) => ({ ...previous, companion: id }));
    setMessage(`${companions.find((item) => item.id === id)?.name || "Your friend"} is ready to garden with you! 💛`);
  }

  const badgeStats = {
    totalCompletions,
    activeDays,
    ownedItems: saved.inventory.length,
    questsClaimed,
    seasonsVisited: saved.seasonsVisited.length,
    companion: saved.companion,
  };
  const earnedBadges = badgesList.filter((badge) => badge.test(badgeStats));

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setHours(12, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));
      const key = localDate(date);
      const count = saved.habits.filter((habit) => habit.done.includes(key)).length;
      const percent = totalHabits ? Math.round((count / totalHabits) * 100) : 0;
      return {
        key,
        count,
        percent,
        day: date.toLocaleDateString("en", { weekday: "short" }),
        date: date.getDate(),
      };
    });
  }, [saved.habits, totalHabits, today]);

  const weeklyTotal = weekDays.reduce((sum, day) => sum + day.count, 0);
  const weeklyPossible = totalHabits * 7;
  const weeklyPercent = weeklyPossible ? Math.round(weeklyTotal / weeklyPossible * 100) : 0;
  const bestDay = weekDays.reduce((best, day) => day.count > best.count ? day : best, weekDays[0]);

  function moveDecoration(event, item) {
    const garden = event.currentTarget.closest(".garden-ground");
    if (!garden) return;
    const bounds = garden.getBoundingClientRect();
    const x = Math.max(5, Math.min(95, ((event.clientX - bounds.left) / bounds.width) * 100));
    const y = Math.max(15, Math.min(90, ((event.clientY - bounds.top) / bounds.height) * 100));
    setSaved((previous) => ({
      ...previous,
      inventory: previous.inventory.map((decoration) =>
        decoration.instanceId === item.instanceId ? { ...decoration, x, y } : decoration
      ),
    }));
  }

  return (
    <div className={`app-shell season-${season} theme-${saved.theme || "rose"}`}>
      <header className="topbar">
        <a className="brand" href="#home" onClick={(event) => { event.preventDefault(); setActiveTab("garden"); }}>
          <span className="brand-icon"><Sprout size={25} /></span>
          <span><strong>Little Wins Garden</strong><small>A little progress, every day</small></span>
        </a>
        <div className="wallet">
          <span className="wallet-drop">💧</span>
          <span><strong>{availableDrops}</strong><small>water drops</small></span>
        </div>
      </header>

      <section className="welcome-row">
        <div>
          <p className="eyebrow"><Sparkles size={14} /> YOUR COZY CORNER</p>
          <h1>Every little win<br />helps you <span>bloom.</span></h1>
          <p className="welcome-copy">Your garden grows at your own pace. No rush, just roots.</p>
        </div>
        <div className="welcome-illustration" aria-hidden="true"><span>🦋</span><span>🌷</span><span>✨</span></div>
      </section>

      <section className="stats-grid">
        <Stat icon={<Check size={19} />} tone="peach" value={`${completedToday}/${totalHabits}`} label="Today's habits" />
        <Stat icon={<Flame size={19} />} tone="yellow" value={`${streak} days`} label="Current streak" />
        <Stat icon={<Droplets size={19} />} tone="green" value={totalCompletions} label="Little wins" />
      </section>

      <nav className="main-tabs">
        <Tab active={activeTab === "garden"} onClick={() => setActiveTab("garden")} icon={<Sprout size={16} />} label="My Garden" />
        <Tab active={activeTab === "quests"} onClick={() => setActiveTab("quests")} icon={<Sparkles size={16} />} label="Daily Quests" />
        <Tab active={activeTab === "shop"} onClick={() => setActiveTab("shop")} icon={<ShoppingBag size={16} />} label="Flower Shop" />
        <Tab active={activeTab === "badges"} onClick={() => setActiveTab("badges")} icon={<Trophy size={16} />} label="Badges" />
        <Tab active={activeTab === "weekly"} onClick={() => setActiveTab("weekly")} icon={<BarChart3 size={16} />} label="Weekly Progress" />
        <Tab active={activeTab === "seasons"} onClick={() => setActiveTab("seasons")} icon={<Sun size={16} />} label="Seasons & Friend" />
      </nav>

      {message && <div className="shop-message"><span>{message}</span><button onClick={() => setMessage("")} aria-label="Dismiss"><X size={15} /></button></div>}

      {activeTab === "garden" && (
        <div className="main-layout">
          <div className="left-column">
            <section className="panel">
              <div className="section-heading">
                <div><p className="eyebrow"><Sun size={14} /> A FRESH LITTLE START</p><h2>Today's habits</h2><p className="muted">Small steps count, even on slow days.</p></div>
                <div className="progress-ring">{todayPercent}%</div>
              </div>
              <div className="progress-track"><span style={{ width: `${todayPercent}%` }} /></div>
              <div className="habit-list">
                {saved.habits.map((habit) => {
                  const done = habit.done.includes(today);
                  return (
                    <div className={`habit-row ${done ? "is-done" : ""}`} key={habit.id}>
                      <span className="habit-emoji">{habit.emoji}</span>
                      <button className="habit-toggle" onClick={() => updateHabit(habit.id)} aria-label={done ? "Mark incomplete" : "Complete habit"}>{done && <Check size={14} />}</button>
                      <button className="habit-name" onClick={() => updateHabit(habit.id)}><span>{habit.name}</span><small>{done ? "Little win planted!" : "One tiny step is enough"}</small></button>
                      <button className="icon-button" onClick={() => deleteHabit(habit.id)} aria-label="Delete habit"><Trash2 size={15} /></button>
                    </div>
                  );
                })}
                {saved.habits.length === 0 && <div className="empty-state"><span>🌱</span><strong>Your garden has room to grow</strong><p>Add your first habit below.</p></div>}
              </div>
              <form className="add-habit-form" onSubmit={addHabit}>
                <select aria-label="Habit emoji" value={newEmoji} onChange={(event) => setNewEmoji(event.target.value)}>
                  {["🌱", "💧", "📚", "🧘", "🚶", "🍎", "🧹", "🎨", "💤", "🧴"].map((emoji) => <option key={emoji}>{emoji}</option>)}
                </select>
                <input value={newHabit} onChange={(event) => setNewHabit(event.target.value)} placeholder="Plant a new habit..." maxLength={60} />
                <button className="primary-button" type="submit"><Plus size={16} /> Add</button>
              </form>
            </section>

            <section className="panel">
              <div className="section-heading compact-heading"><div><p className="eyebrow"><Sparkles size={14} /> TINY CHALLENGES</p><h2>Daily quests</h2></div><button className="text-button" onClick={() => setActiveTab("quests")}>See all <ChevronRight size={14} /></button></div>
              <div className="mini-quest-list">
                {questList.slice(0, 2).map((quest) => {
                  const done = completedToday >= quest.target && quest.target > 0;
                  const claimed = saved.claimedQuests.includes(`${today}:${quest.id}`);
                  return <div className="mini-quest" key={quest.id}><span className="quest-emoji">{quest.emoji}</span><div className="mini-quest-info"><strong>{quest.title}</strong><small>{claimed ? "Reward claimed!" : `${Math.min(completedToday, quest.target)} / ${quest.target} habits`}</small></div><span className="mini-reward">{claimed ? "✓" : `+${quest.reward} 💧`}</span></div>;
                })}
              </div>
              <button className="secondary-button full-button" onClick={() => setActiveTab("quests")}>Visit today's quests</button>
            </section>
          </div>

          <div className="right-column">
            <section className="panel garden-panel">
              <div className="section-heading"><div><p className="eyebrow"><Leaf size={14} /> YOUR HAPPY PLACE</p><h2>My little garden</h2><p className="muted">{seasonInfo.emoji} {seasonInfo.label} · {seasonInfo.description}</p></div><span className="garden-count">{placedItems.length} decorations</span></div>
              <div className={`garden-ground garden-${season} weather-${saved.weather || "sunny"} ${selectedId ? "garden-ready" : ""}`} onClick={(event) => {
                if (!selectedId) return;
                const rect = event.currentTarget.getBoundingClientRect();
                const x = Math.max(5, Math.min(95, ((event.clientX - rect.left) / rect.width) * 100));
                const y = Math.max(15, Math.min(90, ((event.clientY - rect.top) / rect.height) * 100));
                placeItem(selectedId, x, y);
              }}>
                <span className={`garden-sun weather-icon weather-icon-${saved.weather || "sunny"}`}>{saved.weather === "snowy" ? "❄️" : saved.weather === "rainy" ? "🌧️" : saved.weather === "autumn" ? "🍂" : saved.weather === "rainbow" ? "🌈" : "☀️"}</span>
                <div className={`weather-overlay weather-overlay-${saved.weather || "sunny"}`} aria-hidden="true">
                  {Array.from({ length: 8 }, (_, i) => <span key={i} style={{ left: `${3 + (i * 5.35) % 94}%`, animationDelay: `${-(i * 0.47) % 7}s`, animationDuration: `${saved.weather === "rainy" ? 1.25 + (i % 4) * 0.2 : saved.weather === "snowy" ? 4.5 + (i % 5) * 0.65 : saved.weather === "autumn" ? 4.5 + (i % 5) * 0.7 : saved.weather === "rainbow" ? 2.5 + (i % 4) * 0.5 : 2.8 + (i % 4) * 0.5}s` }}>{saved.weather === "rainy" ? (i % 3 === 0 ? "💧" : "╱") : saved.weather === "autumn" ? ["🍂", "🍁", "🍃"][i % 3] : saved.weather === "snowy" ? (i % 4 === 0 ? "❄️" : "❅") : saved.weather === "rainbow" ? "✨" : "✦"}</span>)}
                </div>
                <span className="garden-cloud cloud-one">☁️</span>
                <div className="garden-hill hill-back" /><div className="garden-hill hill-front" />
                <div className="garden-path" />
                <div className="habit-grown-plants" aria-label="Plants grown from completed habits">
                  {saved.habits.map((habit, index) => {
                    const growth = habit.done.length;
                    if (growth === 0) return null;
                    const plantEmoji = growth >= 7 ? "🌻" : growth >= 4 ? "🌷" : growth >= 2 ? "🌿" : "🌱";
                    const left = [24, 38, 52, 66, 78][index % 5];
                    const top = [82, 86, 80, 87, 83][index % 5];
                    return <span
                      className={`habit-grown-plant plant-stage-${growth >= 7 ? "bloom" : growth >= 4 ? "flower" : growth >= 2 ? "leafy" : "sprout"}`}
                      key={habit.id}
                      title={`${habit.name}: ${growth} ${growth === 1 ? "completion" : "completions"}`}
                      style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${index * 0.18}s` }}
                    >{plantEmoji}</span>;
                  })}
                </div>
                <div className="garden-companion" title={companion.name}><span>{companion.emoji}</span><small>{companion.name}</small><span className="bunny-heart">💗</span></div>
                {placedItems.map((item) => <div className={`placed-decoration ${draggingId === item.instanceId ? "being-dragged" : ""}`} key={item.instanceId} style={{ left: `${item.x}%`, top: `${item.y}%` }}>
                  <button className="decoration-emoji" title={`${item.name} — drag to move`} onPointerDown={(event) => {
                    event.stopPropagation();
                    setDraggingId(item.instanceId);
                    event.currentTarget.setPointerCapture?.(event.pointerId);
                  }} onPointerUp={(event) => {
                    if (draggingId === item.instanceId) {
                      moveDecoration(event, item);
                      setDraggingId(null);
                    }
                  }} onClick={(event) => event.stopPropagation()}>{item.emoji}</button>
                  <button className="decoration-remove" title="Return to collection" onClick={(event) => { event.stopPropagation(); returnItem(item.instanceId); }}><X size={12} /></button>
                </div>)}
                {placedItems.length === 0 && saved.habits.every((habit) => habit.done.length === 0) && !selectedId && <div className="garden-empty-hint"><span>🌷</span><strong>Your garden is waiting to bloom</strong><small>Buy a decoration from the shop, then place it here.</small></div>}
                {selectedId && <div className="place-hint"><Sparkles size={14} /> Tap anywhere in the garden to place your decoration</div>}
              </div>
              <div className="garden-legend"><span>🌼 Tap a decoration to move it</span><span>✕ Return it to your collection</span></div>
              <div className="collection-heading"><div><h3>Your collection</h3><p className="muted">Choose an item, then tap the garden.</p></div><span className="collection-count">{collectedItems.length} waiting</span></div>
              <div className="collection-grid">
                {collectedItems.map((item) => <button key={item.instanceId} className={`collection-item ${selectedId === item.instanceId ? "selected" : ""}`} onClick={() => setSelectedId(selectedId === item.instanceId ? null : item.instanceId)}><span>{item.emoji}</span><small>{item.name}</small>{selectedId === item.instanceId && <Check className="collection-check" size={13} />}</button>)}
                {collectedItems.length === 0 && <div className="collection-empty"><span>🧺</span><p>Your collection is empty for now. Visit the Flower Shop to find something lovely!</p></div>}
              </div>
              {selectedId && <button className="text-button cancel-selection" onClick={() => setSelectedId(null)}>Cancel placement</button>}
            </section>

            <section className="companion-card">
              <div className="companion-avatar">{companion.emoji}<span>💗</span></div>
              <div className="companion-message"><p className="eyebrow"><Heart size={13} /> YOUR GARDEN FRIEND</p><strong>{completedToday > 0 ? "I'm so proud of you!" : "I'm here whenever you're ready."}</strong><p>{completedToday > 0 ? `${companion.greeting} You have ${completedToday} little ${completedToday === 1 ? "win" : "wins"} today.` : companion.greeting}</p><button className="text-button" onClick={() => setActiveTab("seasons")}>Visit your friend <ChevronRight size={14} /></button></div>
            </section>
          </div>
        </div>
      )}

      {activeTab === "seasons" && (
        <section className="panel page-panel">
          <div className="section-heading"><div><p className="eyebrow"><Sun size={14} /> A WORLD THAT CHANGES WITH YOU</p><h2>Seasons & your garden friend</h2><p className="muted">Pick the atmosphere that feels right for you.</p></div><div className="weekly-flower">{seasonInfo.emoji}</div></div>
          <div className="season-intro"><span>{seasonInfo.emoji}</span><div><strong>It's {seasonInfo.label} in your garden</strong><p>{seasonInfo.description}. Your decorations and progress stay safe when you switch seasons.</p></div></div>
          <h3 className="subheading">Choose a season</h3>
          <div className="season-grid">
            {Object.entries(seasons).map(([id, item]) => <button key={id} className={`season-card ${season === id ? "selected" : ""} season-card-${id}`} onClick={() => changeSeason(id)}><span className="season-card-emoji">{item.emoji}</span><strong>{item.label}</strong><small>{item.description}</small>{season === id && <span className="season-selected"><Check size={14} /> Current season</span>}</button>)}
          </div>
          <label className="auto-season"><input type="checkbox" checked={saved.autoSeason} onChange={(event) => changeSeason(event.target.checked ? getSeasonFromDate() : saved.season, event.target.checked)} /><span><strong>Follow the real-world calendar</strong><small>Automatically use the season based on the current month.</small></span></label>

          <div className="customization-section">
            <div className="section-heading"><div><p className="eyebrow"><CloudSun size={14} /> YOUR LITTLE SKY</p><h2>Choose your weather</h2><p className="muted">Change the mood of your garden whenever you like.</p></div></div>
            <div className="custom-option-grid">
              {weatherOptions.map((option) => <button key={option.id} className={`custom-option weather-option ${saved.weather === option.id ? "selected" : ""}`} onClick={() => { setSaved((previous) => ({ ...previous, weather: option.id })); setMessage(`${option.label} weather is here! ${option.emoji}`); }}><span className="custom-option-emoji">{option.emoji}</span><strong>{option.label}</strong><small>{option.description}</small>{saved.weather === option.id && <span className="custom-option-selected"><Check size={13} /> Selected</span>}</button>)}
            </div>
          </div>

          <div className="customization-section">
            <div className="section-heading"><div><p className="eyebrow"><Flower2 size={14} /> MAKE IT YOURS</p><h2>Garden color themes</h2><p className="muted">Pick a palette that feels like you.</p></div></div>
            <div className="custom-option-grid theme-option-grid">
              {themeOptions.map((option) => <button key={option.id} className={`custom-option theme-option theme-option-${option.id} ${saved.theme === option.id ? "selected" : ""}`} onClick={() => { setSaved((previous) => ({ ...previous, theme: option.id })); setMessage(`${option.label} theme selected! ${option.emoji}`); }}><span className="custom-option-emoji">{option.emoji}</span><strong>{option.label}</strong><small>{option.description}</small>{saved.theme === option.id && <span className="custom-option-selected"><Check size={13} /> Selected</span>}</button>)}
            </div>
          </div>

          <div className="section-heading companion-section-heading"><div><p className="eyebrow"><PawPrint size={14} /> A FRIEND FOR EVERY LITTLE WIN</p><h2>Choose your companion</h2><p className="muted">Your friend stays with you through every season.</p></div></div>
          <div className="companion-grid">
            {companions.map((friend) => <button key={friend.id} className={`friend-card ${saved.companion === friend.id ? "selected" : ""}`} onClick={() => chooseCompanion(friend.id)}><span className="friend-emoji">{friend.emoji}</span><strong>{friend.name}</strong><small>{friend.greeting}</small>{saved.companion === friend.id && <span className="friend-selected"><Check size={14} /> Your companion</span>}</button>)}
          </div>
          <div className="friend-note"><span>{companion.emoji}</span><div><strong>{companion.name} says...</strong><p>“{completedToday > 0 ? "Look at all the lovely things you've done today! Every little win matters." : companion.greeting}”</p></div></div>
        </section>
      )}

      {activeTab === "quests" && (
        <section className="panel page-panel">
          <div className="section-heading"><div><p className="eyebrow"><Sparkles size={14} /> LITTLE CHALLENGES, LOVELY REWARDS</p><h2>Today's daily quests</h2><p className="muted">Complete habits to earn extra water drops.</p></div><div className="weekly-flower">🧚</div></div>
          <div className="quest-note"><span>💧</span><div><strong>Bonus drops are yours to keep!</strong><p>Claim each completed quest once a day. Your reward is added to your Flower Shop balance and saved automatically.</p></div></div>
          <div className="quest-grid">
            {questList.map((quest) => {
              const done = quest.target > 0 && completedToday >= quest.target;
              const claimed = saved.claimedQuests.includes(`${today}:${quest.id}`);
              const progress = quest.target > 0 ? Math.min(completedToday, quest.target) : 0;
              return <article className={`quest-card ${claimed ? "quest-claimed" : ""}`} key={quest.id}><div className="quest-card-top"><span className="quest-card-emoji">{quest.emoji}</span><span className="reward-pill">💧 +{quest.reward}</span></div><h3>{quest.title}</h3><p>{quest.description}</p><div className="quest-progress-label"><span>Today's progress</span><strong>{progress}/{quest.target}</strong></div><div className="progress-track quest-track"><span style={{ width: `${quest.target ? progress / quest.target * 100 : 0}%` }} /></div><button className={`quest-claim-button ${claimed ? "claimed-button" : ""}`} disabled={!done || claimed} onClick={() => claimQuest(quest)}>{claimed ? <><Check size={15} /> Reward claimed</> : done ? <><Droplets size={15} /> Claim {quest.reward} drops</> : <><LockKeyhole size={14} /> Keep growing</>}</button></article>;
            })}
          </div>
          <div className="quest-footer"><span>🌷</span><p><strong>Remember:</strong> a gentle day still counts. Your garden is here to encourage you, not pressure you.</p></div>
        </section>
      )}

      {activeTab === "shop" && (
        <section className="panel page-panel">
          <div className="section-heading"><div><p className="eyebrow"><ShoppingBag size={14} /> LITTLE TREASURES</p><h2>The Flower Shop</h2><p className="muted">Spend your water drops on something lovely.</p></div><div className="shop-wallet"><span>💧</span><strong>{availableDrops}</strong><small>available</small></div></div>
          <div className="shop-grid">{shopItems.map((item) => <article className="shop-card" key={item.id}><div className={`shop-art art-${item.category}`}><span>{item.emoji}</span></div><h3>{item.name}</h3><p>{item.category === "flower" ? "A lovely bloom for your garden." : item.category === "nature" ? "A tiny touch of woodland magic." : "A little detail to make it yours."}</p><button className="buy-button" disabled={availableDrops < item.price} onClick={() => buyItem(item)}><span>💧 {item.price}</span><span>{availableDrops < item.price ? "Need more" : "Add to collection"}</span></button></article>)}</div>
          <p className="shop-tip"><Sparkles size={15} /> Your purchases stay in your collection, even when you change seasons.</p>
        </section>
      )}

      {activeTab === "badges" && (
        <section className="panel page-panel">
          <div className="section-heading"><div><p className="eyebrow"><Trophy size={14} /> EVERY LITTLE WIN COUNTS</p><h2>Achievement badges</h2><p className="muted">Celebrate the progress you've already made.</p></div><div className="badge-count-large"><Trophy size={20} /><strong>{earnedBadges.length}/{badgesList.length}</strong></div></div>
          <div className="badge-summary"><span>🏆</span><div><strong>Look how far you've come!</strong><p>Badges unlock automatically as you grow habits, explore seasons, and decorate your garden.</p></div></div>
          <div className="badges-grid">{badgesList.map((badge) => { const earned = badge.test(badgeStats); return <article key={badge.id} className={`achievement-card ${earned ? "earned" : "locked"}`}><span className="achievement-art">{earned ? badge.emoji : "🔒"}</span><div className="achievement-copy"><span className="achievement-status">{earned ? "UNLOCKED" : "STILL GROWING"}</span><h3>{badge.name}</h3><p>{badge.description}</p></div>{earned && <span className="achievement-check"><Check size={13} /></span>}</article>; })}</div>
        </section>
      )}

      {activeTab === "weekly" && (
        <section className="panel page-panel">
          <div className="section-heading"><div><p className="eyebrow"><CalendarDays size={14} /> YOUR LITTLE JOURNEY</p><h2>Weekly progress</h2><p className="muted">Seven days of small steps add up to something lovely.</p></div><div className="weekly-flower">🌈</div></div>
          <div className="weekly-stats">
            <WeeklyStat emoji="🌱" value={weeklyTotal} label="Habit check-ins" />
            <WeeklyStat emoji="🌼" value={`${weeklyPercent}%`} label="Weekly completion" />
            <WeeklyStat emoji="☀️" value={bestDay?.count || 0} label={`Best day${bestDay?.count ? ` · ${bestDay.day}` : ""}`} />
          </div>
          <div className="dashboard-card"><div className="dashboard-card-heading"><div><h3><BarChart3 size={18} /> Your 7-day blooms</h3><p>Completed habits each day this week.</p></div><span className="chart-legend"><i /> Habits completed</span></div><div className="bar-chart">{weekDays.map((day, index) => <div className="bar-column" key={day.key}><span className="bar-value">{day.count}</span><div className="bar-track"><div className={`bar-fill bar-color-${index}`} style={{ height: `${day.percent}%` }} /></div><span className="bar-day">{day.day}</span><span className="bar-date">{day.date}</span></div>)}</div><div className="chart-footnote"><Sparkles size={15} /> Every completed habit is a little bloom. Keep showing up for yourself.</div></div>
          <div className="dashboard-card"><div className="dashboard-card-heading"><div><h3><CalendarDays size={18} /> Your 7-day calendar</h3><p>More filled squares mean more habits completed.</p></div></div><div className="heatmap-legend"><span>Less</span><i className="heat-level-0" /><i className="heat-level-1" /><i className="heat-level-2" /><i className="heat-level-3" /><span>More</span></div><div className="heatmap-grid">{weekDays.map((day) => <div className="heatmap-day" key={day.key}><span className="heatmap-weekday">{day.day}</span><div className={`heat-cell ${day.count === 0 ? "heat-level-0" : day.percent < 50 ? "heat-level-1" : day.percent < 100 ? "heat-level-2" : "heat-level-3"}`} title={`${day.count} habits completed on ${day.key}`}>{day.count}</div><small>{day.date}</small></div>)}</div><div className="heatmap-summary"><span>🌿</span><p><strong>{activeDays} active days so far.</strong><br />This counts all dates in your saved habit history.</p></div></div>
          <div className="dashboard-card"><div className="dashboard-card-heading"><div><h3><Leaf size={18} /> Habit garden report</h3><p>How often each habit was completed in the last seven days.</p></div></div>{saved.habits.length ? saved.habits.map((habit) => { const count = weekDays.filter((day) => habit.done.includes(day.key)).length; return <div className="habit-week-row" key={habit.id}><span className="habit-week-emoji">{habit.emoji}</span><div className="habit-week-info"><strong>{habit.name}</strong><div className="progress-track"><span style={{ width: `${count / 7 * 100}%` }} /></div></div><span className="habit-week-count">{count}/7</span></div>; }) : <p className="muted">Add a habit to begin your weekly report.</p>}</div>
          <p className="dashboard-note">Your chart uses your saved completion dates. Weekly percentages are based on your current habit list.</p>
        </section>
      )}

      <footer className="app-footer"><span>🌷</span> Made with care, one little win at a time <span>🌷</span><small>Your garden is saved automatically on this device.</small></footer>
    </div>
  );
}

function Stat({ icon, tone, value, label }) {
  return <div className="stat-card"><span className={`stat-icon ${tone}`}>{icon}</span><div><strong>{value}</strong><span>{label}</span></div></div>;
}

function Tab({ active, onClick, icon, label }) {
  return <button className={`tab ${active ? "active" : ""}`} onClick={onClick}>{icon}{label}</button>;
}

function WeeklyStat({ emoji, value, label }) {
  return <div className="weekly-stat"><span className="weekly-stat-icon green">{emoji}</span><div><strong>{value}</strong><small>{label}</small></div></div>;
}

createRoot(document.getElementById("root")).render(<App />);
