export const ingredients = [
  { id: 'carrot', name: '당근', color: '#FF7043', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=300&q=80' },
  { id: 'kale', name: '케일', color: '#66BB6A', image: 'https://images.unsplash.com/photo-1524179091875-bf99a9a6af57?auto=format&fit=crop&w=300&q=80' },
  { id: 'tomato', name: '토마토', color: '#EF5350', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=300&q=80' },
  { id: 'avocado', name: '아보카도', color: '#9CCC65', image: 'https://images.unsplash.com/photo-1523049673856-6468baca292f?auto=format&fit=crop&w=300&q=80' },
];

export const recipes = [
  {
    id: 1,
    title: '구운 당근 수프',
    description: '구운 당근과 생강으로 만든 따뜻하고 편안한 수프입니다.',
    ingredientId: 'carrot',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
    time: '45분',
    difficulty: '쉬움',
  },
  {
    id: 2,
    title: '케일 시저 샐러드',
    description: '신선한 케일을 사용한 클래식 시저 샐러드의 건강한 변신입니다.',
    ingredientId: 'kale',
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=600&q=80',
    time: '15분',
    difficulty: '쉬움',
  },
  {
    id: 3,
    title: '토마토 바질 파스타',
    description: '신선한 토마토와 바질이 어우러진 간단하지만 맛있는 파스타입니다.',
    ingredientId: 'tomato',
    image: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&w=600&q=80',
    time: '25분',
    difficulty: '보통',
  },
  {
    id: 4,
    title: '아보카도 토스트',
    description: '구운 사워도우 빵 위에 크리미한 아보카도와 고춧가루를 곁들였습니다.',
    ingredientId: 'avocado',
    image: 'https://images.unsplash.com/photo-1588137372308-15f75323ca8d?auto=format&fit=crop&w=600&q=80',
    time: '10분',
    difficulty: '쉬움',
  },
  {
    id: 5,
    title: '당근 케이크',
    description: '크림치즈 프로스팅을 얹은 촉촉하고 향긋한 당근 케이크입니다.',
    ingredientId: 'carrot',
    image: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=600&q=80',
    time: '60분',
    difficulty: '어려움',
  },
];
