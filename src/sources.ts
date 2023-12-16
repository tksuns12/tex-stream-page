
export const serverUrl = `wss://22v7kvbp5b.execute-api.ap-northeast-2.amazonaws.com/prod/`
export const question = `시각 \\( t=0 \\) 일 때 동시에 원점을 출발하여 수직선 위를 움직이는 두 점 \\( \\mathrm{P}, \\mathrm{Q} \\) 의 시각 \\( t(t \\geq 0) \\) 에서의 속도가 각각\n\\[\nv_{1}(t)=t^{2}-6 t+5, \\quad v_{2}(t)=2 t-7\n\\]\n\n이다. 시각 \\( t \\) 에서의 두 점 \\( \\mathrm{P}, \\mathrm{Q} \\) 사이의 거리를 \\( f(t) \\) 라 할 때, 함수 \\( f(t) \\) 는 구간 \\( [0, a] \\) 에서 증가하고, 구간 \\( [a, b] \\) 에서 감소하고, 구간 \\( [b, \\infty) \\) 에서 증가한다. 시각 \\( t=a \\) 에서 \\( t=b \\) 까지 점 \\( \\mathrm{Q} \\) 가 움직인 거리는? (단, \\( 0<a<b \\) ) [4점]\n(1) \\( \\frac{15}{2} \\)\n(2) \\( \\frac{17}{2} \\)\n(3) \\( \\frac{19}{2} \\)\n(4) \\( \\frac{21}{2} \\)\n(5) \\( \\frac{23}{2} \\)`

export const data = {
  action: 'editor',
  userId: 'string',
  messages: [
    {
      role: 'user',
      content: question,
      imageUrl: [
        'https://mathtutor-wim-staging.s3.ap-northeast-2.amazonaws.com/latex/assets/고등/수학Ⅱ/3.적분/수학Ⅱ정적분의활용/상/f91a8514-e5e2-4c28-a5e8-bf7c26fba762.jpg',
      ],
    },
  ],
}