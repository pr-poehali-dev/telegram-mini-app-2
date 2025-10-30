import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

type Match = {
  id: number;
  league: string;
  country: string;
  time: string;
  date: string;
  team1: string;
  team1Icon: string;
  team2: string;
  team2Icon: string;
  odds: number;
  status: 'upcoming' | 'live';
};

type Prediction = {
  id: number;
  match: Match;
  prediction: string;
  result: string;
  opened: string;
  status: 'open' | 'won' | 'lost';
  winAmount?: number;
};

type Stats = {
  total: number;
  won: number;
  lost: number;
  open: number;
  winRate: number;
  totalProfit: number;
};

const Index = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'predictions' | 'profile'>('home');
  const [predictionFilter, setPredictionFilter] = useState<'all' | 'open' | 'won' | 'lost'>('all');
  const [balance, setBalance] = useState(0);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [userReferralCode, setUserReferralCode] = useState('');
  const [referralCount, setReferralCount] = useState(0);
  const [telegramId] = useState(123456789);
  const [userPredictions, setUserPredictions] = useState<Prediction[]>([]);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch(
        `https://functions.poehali.dev/2d7391fd-c275-4ea4-b473-e73b27b51e63?telegram_id=${telegramId}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setBalance(data.user.balance);
        setUserReferralCode(data.user.referral_code);
        setReferralCount(data.referral_count);
      } else {
        const createResponse = await fetch(
          'https://functions.poehali.dev/2d7391fd-c275-4ea4-b473-e73b27b51e63',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              telegram_id: telegramId,
              username: 'Artem',
              first_name: 'Artem'
            })
          }
        );
        
        if (createResponse.ok) {
          const data = await createResponse.json();
          setBalance(data.user.balance);
          setUserReferralCode(data.user.referral_code);
          setReferralCount(0);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleMatchClick = (match: Match) => {
    setSelectedMatch(match);
    setShowMatchModal(true);
  };

  const handleMakePrediction = async () => {
    if (balance < 1) {
      alert('Недостаточно монет! Пополните баланс.');
      return;
    }

    if (selectedMatch) {
      const newPrediction: Prediction = {
        id: Date.now(),
        match: selectedMatch,
        prediction: 'Прогноз исхода',
        result: `Победа 1`,
        opened: new Date().toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        status: 'open'
      };

      setUserPredictions([newPrediction, ...userPredictions]);
      setBalance(balance - 1);
      setShowMatchModal(false);
      setActiveTab('predictions');
    }
  };

  const copyReferralLink = () => {
    const link = `https://t.me/your_bot?start=${userReferralCode}`;
    navigator.clipboard.writeText(link);
    alert('Ссылка скопирована!');
  };

  const matches: Match[] = [
    {
      id: 1,
      league: 'МЛБ | USA',
      country: '⚾',
      time: '02:05',
      date: '12.08.2025',
      team1: 'Техас Рейнджерс',
      team1Icon: '🏅',
      team2: 'Аризона Даймондбэкс',
      team2Icon: '🏅',
      odds: 2.4,
      status: 'upcoming'
    },
    {
      id: 2,
      league: 'МЛБ | USA',
      country: '⚾',
      time: '02:10',
      date: '12.08.2025',
      team1: 'Хьюстон Астрос',
      team1Icon: '🏅',
      team2: 'Бостон Ред Сокс',
      team2Icon: '🏅',
      odds: 2.0,
      status: 'upcoming'
    },
    {
      id: 3,
      league: 'Премьер-лига | ENG',
      country: '⚽',
      time: '17:30',
      date: '04.05.2025',
      team1: 'Челси',
      team1Icon: '🔵',
      team2: 'Ливерпуль',
      team2Icon: '🔴',
      odds: 2.4,
      status: 'upcoming'
    },
    {
      id: 4,
      league: 'Лига чемпионов | EUR',
      country: '⚽',
      time: '21:00',
      date: '30.04.2025',
      team1: 'Барселона',
      team1Icon: '🔴🔵',
      team2: 'Интер',
      team2Icon: '⚫🔵',
      odds: 4.5,
      status: 'upcoming'
    }
  ];

  const predictions: Prediction[] = [
    {
      id: 1,
      match: {
        id: 101,
        league: 'Еврохоккейтур | WLD',
        country: '🏒',
        time: '16:00',
        date: '04.05.2025',
        team1: 'Чехия',
        team1Icon: '🇨🇿',
        team2: 'Швейцария',
        team2Icon: '🇨🇭',
        odds: 2.7,
        status: 'upcoming'
      },
      prediction: 'Победа (с учетом ОТ и буллитов)',
      result: 'Победа 2',
      opened: 'May 4, 2025 03:52',
      status: 'won',
      winAmount: 2.7
    },
    {
      id: 2,
      match: {
        id: 102,
        league: 'Премьер-лига | ENG',
        country: '⚽',
        time: '17:30',
        date: '04.05.2025',
        team1: 'Челси',
        team1Icon: '🔵',
        team2: 'Ливерпуль',
        team2Icon: '🔴',
        odds: 2.4,
        status: 'upcoming'
      },
      prediction: 'Прогноз исхода',
      result: 'Фора 2',
      opened: 'May 4, 2025 03:50',
      status: 'lost'
    },
    {
      id: 3,
      match: {
        id: 103,
        league: 'НБА | USA',
        country: '🏀',
        time: '02:30',
        date: '03.05.2025',
        team1: 'Лейкерс',
        team1Icon: '💜💛',
        team2: 'Уорриорз',
        team2Icon: '💙💛',
        odds: 3.2,
        status: 'upcoming'
      },
      prediction: 'Прогноз исхода',
      result: 'Победа 1',
      opened: 'May 3, 2025 01:20',
      status: 'won',
      winAmount: 3.2
    }
  ];

  const allPredictions = [...userPredictions, ...predictions];
  const filteredPredictions = predictionFilter === 'all' 
    ? allPredictions 
    : allPredictions.filter(p => p.status === predictionFilter);

  const calculateStats = (): Stats => {
    const total = allPredictions.length;
    const won = allPredictions.filter(p => p.status === 'won').length;
    const lost = allPredictions.filter(p => p.status === 'lost').length;
    const open = allPredictions.filter(p => p.status === 'open').length;
    const winRate = total > 0 ? Math.round((won / total) * 100) : 0;
    const totalProfit = allPredictions.reduce((sum, p) => {
      if (p.status === 'won') return sum + (p.winAmount || 0) - 1;
      if (p.status === 'lost') return sum - 1;
      return sum;
    }, 0);
    
    return { total, won, lost, open, winRate, totalProfit: Math.round(totalProfit * 10) / 10 };
  };

  const purchaseOptions = [
    { coins: 10, stars: 300, bonus: 0 },
    { coins: 25, stars: 750, bonus: 2 },
    { coins: 50, stars: 1500, bonus: 5 },
    { coins: 100, stars: 3000, bonus: 10 },
    { coins: 200, stars: 6000, bonus: 20 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <button className="text-sm font-medium">Закрыть</button>
          <div className="text-center">
            <h1 className="text-lg font-bold">Sportify AI</h1>
            <p className="text-xs text-gray-500">мини-приложение</p>
          </div>
          <button>
            <Icon name="MoreVertical" size={20} />
          </button>
        </div>
      </header>

      <div className="px-4 py-6">
        {activeTab === 'home' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                Привет, Artem 🐻 ⚽
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowBalanceModal(true)}
                  className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-gray-200"
                >
                  <Icon name="Wallet" size={16} className="text-amber-500" />
                  <span className="font-semibold">{balance}</span>
                </button>
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                  <img 
                    src="https://cdn.poehali.dev/files/9ef8b515-4c7b-4b46-80d3-e5f412cc7ca6.png" 
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {matches.map((match) => (
                <Card 
                  key={match.id} 
                  className="p-4 bg-white rounded-2xl border-gray-100 cursor-pointer hover:shadow-md transition"
                  onClick={() => handleMatchClick(match)}
                >
                  <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                    <span>{match.country}</span>
                    <Icon name="Lock" size={12} />
                    <span>{match.league}</span>
                    <span className="ml-auto">{match.time} {match.date}</span>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{match.team1Icon}</span>
                      <span className="font-medium">{match.team1}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{match.team2Icon}</span>
                      <span className="font-medium">{match.team2}</span>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100 text-lg font-bold px-4 py-2 rounded-xl">
                      {match.odds}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {activeTab === 'predictions' && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">
                Мои прогнозы 🏆
              </h2>
              
              <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-100 mb-4">
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{calculateStats().total}</div>
                    <div className="text-xs text-gray-600">Всего</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{calculateStats().won}</div>
                    <div className="text-xs text-gray-600">Выигрыши</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{calculateStats().lost}</div>
                    <div className="text-xs text-gray-600">Проигрыши</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{calculateStats().winRate}%</div>
                    <div className="text-xs text-gray-600">Винрейт</div>
                  </div>
                </div>
                
                <Separator className="my-3" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Общая прибыль:</span>
                  <div className="flex items-center gap-2">
                    <Icon name="TrendingUp" size={18} className={calculateStats().totalProfit >= 0 ? 'text-green-500' : 'text-red-500'} />
                    <span className={`font-bold text-lg ${calculateStats().totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {calculateStats().totalProfit > 0 ? '+' : ''}{calculateStats().totalProfit} монет
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowBalanceModal(true)}
                  className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-gray-200"
                >
                  <Icon name="Wallet" size={16} className="text-amber-500" />
                  <span className="font-semibold">{balance}</span>
                </button>
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                  <img 
                    src="https://cdn.poehali.dev/files/9ef8b515-4c7b-4b46-80d3-e5f412cc7ca6.png" 
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              <Button
                variant={predictionFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPredictionFilter('all')}
                className={`rounded-full whitespace-nowrap ${predictionFilter === 'all' ? 'bg-blue-500' : ''}`}
              >
                Все ({allPredictions.length})
              </Button>
              <Button
                variant={predictionFilter === 'open' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPredictionFilter('open')}
                className={`rounded-full whitespace-nowrap ${predictionFilter === 'open' ? 'bg-amber-500' : ''}`}
              >
                Открытые ({allPredictions.filter(p => p.status === 'open').length})
              </Button>
              <Button
                variant={predictionFilter === 'won' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPredictionFilter('won')}
                className={`rounded-full whitespace-nowrap ${predictionFilter === 'won' ? 'bg-green-500' : ''}`}
              >
                Выиграли ({allPredictions.filter(p => p.status === 'won').length})
              </Button>
              <Button
                variant={predictionFilter === 'lost' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPredictionFilter('lost')}
                className={`rounded-full whitespace-nowrap ${predictionFilter === 'lost' ? 'bg-red-500' : ''}`}
              >
                Проиграли ({allPredictions.filter(p => p.status === 'lost').length})
              </Button>
            </div>

            <div className="space-y-3">
              {filteredPredictions.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Icon name="Trophy" size={48} className="mx-auto mb-4 opacity-30" />
                  <p>Нет прогнозов с таким статусом</p>
                </div>
              )}
              {filteredPredictions.map((pred) => (
                <Card key={pred.id} className="p-4 bg-white rounded-2xl border-gray-100">
                  <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                    <span>{pred.match.country}</span>
                    <Icon name="Lock" size={12} />
                    <span>{pred.match.league}</span>
                    <span className="ml-auto">{pred.match.time} {pred.match.date}</span>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{pred.match.team1Icon}</span>
                      <span className="font-medium">{pred.match.team1}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{pred.match.team2Icon}</span>
                      <span className="font-medium">{pred.match.team2}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Icon 
                      name={pred.status === 'won' ? 'CheckCircle' : pred.status === 'lost' ? 'XCircle' : 'Clock'} 
                      size={16} 
                      className={pred.status === 'won' ? 'text-green-500' : pred.status === 'lost' ? 'text-red-500' : 'text-amber-500'} 
                    />
                    <span>
                      {pred.status === 'won' && 'Выиграл'}
                      {pred.status === 'lost' && 'Проиграл'}
                      {pred.status === 'open' && `Открыто: ${pred.opened}`}
                    </span>
                  </div>

                  <Separator className="my-3" />

                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs text-gray-500">Прогноз исхода</div>
                      <div className="font-medium">{pred.result}</div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100 text-lg font-bold px-4 py-2 rounded-xl">
                        {pred.match.odds}
                      </Badge>
                      {pred.status === 'won' && pred.winAmount && (
                        <div className="text-xs text-green-600 font-semibold mt-1">
                          +{pred.winAmount - 1} монет
                        </div>
                      )}
                      {pred.status === 'lost' && (
                        <div className="text-xs text-red-600 font-semibold mt-1">
                          -1 монета
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {activeTab === 'profile' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                Профиль 👤
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowBalanceModal(true)}
                  className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-gray-200"
                >
                  <Icon name="Wallet" size={16} className="text-amber-500" />
                  <span className="font-semibold">{balance}</span>
                </button>
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                  <img 
                    src="https://cdn.poehali.dev/files/9ef8b515-4c7b-4b46-80d3-e5f412cc7ca6.png" 
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Card 
                className="p-4 bg-white rounded-2xl border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
                onClick={() => setShowBalanceModal(true)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                    <Icon name="Plus" size={24} className="text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Купить монеты</div>
                    <div className="text-sm text-gray-500">Пополни баланс для новых прогнозов</div>
                  </div>
                </div>
                <Icon name="ChevronRight" size={20} className="text-gray-400" />
              </Card>

              <Card 
                className="p-4 bg-white rounded-2xl border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
                onClick={() => setShowReferralModal(true)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Icon name="Gift" size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Бесплатные монеты</div>
                    <div className="text-sm text-gray-500">Выполняй задания - получай монеты</div>
                  </div>
                </div>
                <Icon name="ChevronRight" size={20} className="text-gray-400" />
              </Card>

              <Card className="p-4 bg-white rounded-2xl border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Icon name="Wallet" size={24} className="text-amber-600" />
                  </div>
                  <div>
                    <div className="font-semibold">История пополнений</div>
                    <div className="text-sm text-gray-500">Мои пополнения баланса</div>
                  </div>
                </div>
                <Icon name="ChevronRight" size={20} className="text-gray-400" />
              </Card>

              <Card className="p-4 bg-white rounded-2xl border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                    <Icon name="Languages" size={24} className="text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Язык</div>
                    <div className="text-sm text-gray-500">Изменить язык приложения</div>
                  </div>
                </div>
                <Icon name="ChevronRight" size={20} className="text-gray-400" />
              </Card>

              <Card className="p-4 bg-white rounded-2xl border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Icon name="Headphones" size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Поддержка</div>
                    <div className="text-sm text-gray-500">Свяжитесь с нами в Telegram</div>
                  </div>
                </div>
                <Icon name="ChevronRight" size={20} className="text-gray-400" />
              </Card>
            </div>
          </>
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around items-center">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 py-2 px-4 transition ${
              activeTab === 'home' ? 'text-amber-500' : 'text-gray-400'
            }`}
          >
            <Icon name="Home" size={24} />
            <span className="text-xs font-medium">Главная</span>
          </button>
          <button
            onClick={() => setActiveTab('predictions')}
            className={`flex flex-col items-center gap-1 py-2 px-4 transition ${
              activeTab === 'predictions' ? 'text-amber-500' : 'text-gray-400'
            }`}
          >
            <Icon name="Trophy" size={24} />
            <span className="text-xs font-medium">Мои прогнозы</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 py-2 px-4 transition ${
              activeTab === 'profile' ? 'text-amber-500' : 'text-gray-400'
            }`}
          >
            <Icon name="User" size={24} />
            <span className="text-xs font-medium">Профиль</span>
          </button>
        </div>
      </nav>

      <Dialog open={showBalanceModal} onOpenChange={setShowBalanceModal}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Icon name="Wallet" size={24} className="text-amber-500" />
              Твой баланс
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="text-sm text-gray-500 mb-1">Текущий баланс</div>
              <div className="flex items-center gap-2 text-3xl font-bold">
                <Icon name="Wallet" size={32} className="text-amber-500" />
                {balance}
              </div>
              <div className="text-sm text-gray-500 italic mt-2">1 монета = 1 прогноз</div>
            </div>

            <Button className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white rounded-xl py-6 text-base font-semibold">
              🎁 Бесплатные монеты 🎁
            </Button>

            <div className="text-sm font-semibold text-gray-700">Купить ещё монеты</div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {purchaseOptions.map((option, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon name="Wallet" size={20} className="text-amber-500" />
                    <span className="font-semibold">{option.coins} монет</span>
                    {option.bonus > 0 && (
                      <Badge className="bg-amber-100 text-amber-700 text-xs">
                        +{option.bonus} бонус
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Icon name="Star" size={16} className="text-amber-500 fill-amber-500" />
                      <span className="font-semibold">{option.stars} звёзд</span>
                    </div>
                    <Button className="bg-amber-400 hover:bg-amber-500 text-white rounded-lg px-4 py-2 text-sm font-semibold">
                      Купить
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showReferralModal} onOpenChange={setShowReferralModal}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Icon name="Gift" size={24} className="text-blue-600" />
              Бонусы 🎁
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-gray-600">
              Выполняй задания, чтобы получить монеты для открытия новых прогнозов
            </p>

            <Card className="p-4 bg-purple-50 border-purple-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Icon name="Smartphone" size={24} className="text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Сохранить приложение</div>
                    <div className="text-sm text-amber-600 font-semibold">+2 монеты</div>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  <Icon name="CheckCircle" size={14} className="mr-1" />
                  Завершено
                </Badge>
              </div>
            </Card>

            <Separator />

            <div>
              <h3 className="font-bold text-lg mb-2">Реферальная программа</h3>
              <Card className="p-4 bg-blue-50 border-blue-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Icon name="Users" size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Приглашай и открывай больше</div>
                    <div className="text-sm text-gray-600">
                      Приглашай друзей и получай монеты за каждую регистрацию
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 mb-3">
                  <div className="text-sm text-gray-500 mb-1">Твоя реферальная ссылка</div>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="flex-1 bg-gray-50 px-3 py-2 rounded-lg text-xs font-mono break-all">
                      https://t.me/your_bot?start={userReferralCode}
                    </code>
                    <Button
                      onClick={copyReferralLink}
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <Icon name="Copy" size={16} />
                    </Button>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 mb-3">
                  <div className="text-sm text-gray-500 mb-1">Приглашено друзей</div>
                  <div className="text-2xl font-bold text-blue-600">{referralCount} {referralCount === 1 ? 'друг' : 'друзей'}</div>
                </div>

                <Button 
                  onClick={copyReferralLink}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2"
                >
                  Поделиться
                  <Icon name="Share2" size={18} />
                </Button>

                <p className="text-xs text-gray-500 text-center mt-2">
                  Поделись этой ссылкой с друзьями, и получай по 1 монете за каждую регистрацию!
                </p>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showMatchModal} onOpenChange={setShowMatchModal}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Сделать прогноз</DialogTitle>
          </DialogHeader>

          {selectedMatch && (
            <div className="space-y-4">
              <Card className="p-4 bg-gray-50 border-gray-100">
                <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                  <span>{selectedMatch.country}</span>
                  <Icon name="Lock" size={12} />
                  <span>{selectedMatch.league}</span>
                  <span className="ml-auto">{selectedMatch.time} {selectedMatch.date}</span>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{selectedMatch.team1Icon}</span>
                    <span className="font-medium">{selectedMatch.team1}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{selectedMatch.team2Icon}</span>
                    <span className="font-medium">{selectedMatch.team2}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Коэффициент:</span>
                  <Badge className="bg-amber-100 text-amber-900 text-lg font-bold px-4 py-2 rounded-xl">
                    {selectedMatch.odds}
                  </Badge>
                </div>
              </Card>

              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Стоимость прогноза:</span>
                  <div className="flex items-center gap-2">
                    <Icon name="Wallet" size={18} className="text-amber-500" />
                    <span className="font-bold">1 монета</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Ваш баланс:</span>
                  <div className="flex items-center gap-2">
                    <Icon name="Wallet" size={18} className="text-amber-500" />
                    <span className="font-bold">{balance} монет</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleMakePrediction}
                disabled={balance < 1}
                className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white rounded-xl py-6 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {balance < 1 ? 'Недостаточно монет' : 'Сделать прогноз'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;