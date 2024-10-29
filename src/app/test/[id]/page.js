// app/test/[id]/page.js
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const TestPage = ({ params }) => {
    const [topice, setTopice] = useState(null);
    const [answers, setAnswers] = useState([]); // 각 문항의 정답 상태도 포함
    const router = useRouter();
    const id = Number(params.id);

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/topices/${params.id}`);
            if (response.ok) {
                const data = await response.json();
                setTopice(data);
            } else {
                console.error('Failed to fetch topic');
                router.push('/');
            }

            const answerListResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/answers`);
            if(answerListResponse.ok) {
                const answerListData = await answerListResponse.json();
                const currentPageData = answerListData.find(data => data.id === id);
                if(currentPageData && currentPageData.id === id) {
                    setAnswers(currentPageData.answers);
                }
            } else {
                console.error('Failed to fetch answers');
            }
        };

        fetchData();
    }, [params.id, router]);

    // 정답과 오답을 카운트하는 변수
    const scoreO = answers.filter(answer => answer.correct === 'O').length;
    const scoreX = answers.filter(answer => answer.correct === 'X').length;
    const notCheck = answers.map((answer, index) => !answer.correct ? index + 1 : null).filter(index => index !== null);

    const calc = () => {
        const sum = scoreO + scoreX;
        if(sum < topice.questions) {
            alert(`체크하지 않은 문항이 있습니다. 체크하지 않은 문제의 개수 ${notCheck}`);
        } else {
            alert(`${topice.questions} 문제 중에 정답 : ${scoreO} 오답 : ${scoreX}`);
        }
    }

    const scoreCalc = (index, value) => {
        // 클릭한 문항의 정답/오답 상태를 업데이트
        setAnswers(prevAnswers => {
            const updateAnswers = [...prevAnswers];
            updateAnswers[index] = {
                ...updateAnswers[index],
                correct: value, // O 또는 X 값으로 상태를 업데이트
            };
            return updateAnswers;
        });
    };

    const handleInputChange = (index, field, value) => {
        setAnswers(prevAnswers => {
            const updateAnswers = [...prevAnswers];
            updateAnswers[index] = {
                ...updateAnswers[index],
                [field]: value,
            }
            return updateAnswers;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/answers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, answers }),
            });
    
            if (response.ok) {
                const result = await response.json();
                console.log('답안이 성공적으로 저장되었습니다:', result);
            } else {
                console.error('답안 저장 실패:', response.statusText);
            }
        } catch (error) {
            console.error('서버와의 통신 중 오류 발생:', error);
        }
    };

    let questions = [];
    if (topice && topice.questions) {
        for(let i = 0; i < topice.questions; i++) {
            questions.push(
                <div 
                    key={i}
                    className={`question ${answers[i]?.correct && answers[i]?.correct === 'O' ? 'green' : answers[i]?.correct === 'X' ? 'red' : 'initial'}`}
                >
                    <h3 className='askNum'>문항 {i + 1}</h3>
                    <p>
                        <label>시험 문제:</label>
                        <textarea 
                            type="text" 
                            className={`questionField ${answers[i]?.correct && answers[i]?.correct === 'O' ? 'green' : answers[i]?.correct === 'X' ? 'red' : 'initial'}`}
                            name={`question-${i}`} 
                            placeholder='시험 문제 입력'
                            value={answers[i]?.question || ''}
                            onChange={(e) => handleInputChange(i, 'question', e.target.value)}
                        />
                    </p>
                    <p>
                        <label>답안:</label>
                        <textarea 
                            type="text"
                            className={`answerField ${answers[i]?.correct && answers[i]?.correct === 'O' ? 'green' : answers[i]?.correct === 'X' ? 'red' : 'initial'}`}
                            name={`answer-${i}`} 
                            placeholder='답안 입력'
                            value={answers[i]?.answer || ''}
                            onChange={(e) => handleInputChange(i, 'answer', e.target.value)}
                        />
                    </p>
                    <div className='correctBtn'>
                        <button 
                            className={`correct ${answers[i]?.correct && answers[i]?.correct === 'O' ? 'green' : answers[i]?.correct === 'X' ? 'red' : 'initial'}`}
                            type='button' 
                            onClick={() => scoreCalc(i, 'O')} 
                            value='O'
                        >
                            O
                        </button>
                        <button
                            className={`rong ${answers[i]?.correct && answers[i]?.correct === 'O' ? 'green' : answers[i]?.correct === 'X' ? 'red' : 'initial'}`}
                            type='button' 
                            onClick={() => scoreCalc(i, 'X')} 
                            value='X'
                        >
                            X
                        </button>
                    </div>
                </div>
            );
        }
    }

    return (
        <div className='testContainer'>
            {topice ? (
                <>
                    <h2>{topice.title}</h2>
                    <form onSubmit={handleSubmit}>
                        {questions}
                        <div className="buttonContainer">
                            <button className='submitBtn' type="submit">제출</button>
                            <button className='calcBtn' type="button" onClick={calc}>계산</button>
                        </div>
                    </form>
                </>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default TestPage;