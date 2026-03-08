import React, { useState } from 'react';
import { 
  SafeAreaView, ScrollView, Text, List, Box, Typography, 
  FixedBottomButton, Spacing, ThemeProvider 
} from '@apps-in-toss/design-system';
import { toss } from '@apps-in-toss/framework';

const GEMINI_API_KEY = "AIzaSyCJca3jLT37Q-6Wy5fH287wOWMJN4w6wO8";

const App = () => {
  const [step, setStep] = useState(0); 
  const [answers, setAnswers] = useState([]);
  const [analysis, setAnalysis] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchAnalysis = async (userAnswers) => {
    setIsLoading(true);
    const prompt = `너는 뇌과학 기반 심리 분석가야. 유저가 자존감 테스트에 [${userAnswers.join(", ")}]라고 답했어. 이 답변을 뇌과학 관점에서 분석해줘. 3문장 이내로 따뜻하게 위로하고, 결제 후 더 깊은 'Mind Check' 처방이 가능하다는 점을 언급해줘.`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await response.json();
      setAnalysis(data.candidates[0].content.parts[0].text);
    } catch (error) {
      setAnalysis("마음을 분석하는 중에 오류가 발생했어요. 잠시 후 다시 시도해 주세요.");
    }
    setIsLoading(false);
  };

  const handlePayment = async () => {
    try {
      await toss.pay({
        amount: 4900,
        orderId: `mind_check_${Date.now()}`,
        orderName: '마음 진단서: 정밀 뇌과학 처방전',
      });
      setStep(5);
    } catch (e) {
      alert("결제가 완료되지 않았습니다.");
    }
  };

  const questions = [
    { title: "1. 자책의 빈도", desc: "실수를 했을 때 자신을 얼마나 자책하시나요?", options: ["매우 자주", "가끔", "거의 안 함"] },
    { title: "2. 타인의 시선", desc: "주변의 시선이나 비판에 민감하게 반응하시나요?", options: ["매우 예민함", "보통", "의연함"] },
    { title: "3. 현재의 몸 신호", desc: "불안할 때 몸에서 느껴지는 가장 큰 반응은?", options: ["가슴 답답함", "머리 무거움", "어깨 긴장", "무기력함"] },
  ];

  return (
    <ThemeProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <ScrollView contentContainerStyle={{ padding: 24 }}>
          {step === 0 && (
            <Box>
              <Typography.H1>마음 진단서</Typography.H1>
              <Spacing size={16} />
              <Typography.P color="grey700">뇌과학으로 당신의 자존감을 체크합니다.</Typography.P>
              <FixedBottomButton label="무료 진단 시작하기" onClick={() => setStep(1)} />
            </Box>
          )}

          {step >= 1 && step <= 3 && (
            <Box>
              <Typography.H3>{questions[step-1].title}</Typography.H3>
              <Typography.Span color="grey600">{questions[step-1].desc}</Typography.Span>
              <List style={{ marginTop: 24 }}>
                {questions[step-1].options.map((opt) => (
                  <List.Row key={opt} contents={<Text>{opt}</Text>} withArrow
                    onClick={() => {
                      const newAnswers = [...answers, opt];
                      setAnswers(newAnswers);
                      if (step === 3) { setStep(4); fetchAnalysis(newAnswers); }
                      else { setStep(step + 1); }
                    }} 
                  />
                ))}
              </List>
            </Box>
          )}

          {step === 4 && (
            <Box>
              <Typography.H3>나의 뇌 분석 결과</Typography.H3>
              <Spacing size={20} />
              <Box background="blue50" padding={20} borderRadius={16}>
                {isLoading ? <Text>정밀 분석 중...</Text> : <Text>{analysis}</Text>}
              </Box>
              <FixedBottomButton label="4,900원에 전문 처방전 받기" onClick={handlePayment} />
            </Box>
          )}

          {step === 5 && (
            <Box>
              <Typography.H3>Mind Check 심층 상담</Typography.H3>
              <Spacing size={20} />
              <Typography.P>결제가 완료되었습니다! 이제부터 더 깊은 대화를 나눌 수 있습니다.</Typography.P>
            </Box>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemeProvider>
  );
};

export default App;