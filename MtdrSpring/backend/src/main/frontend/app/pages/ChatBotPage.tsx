import { useState, useEffect, useRef } from 'react';
import { Send, TrendingUp, Users, AlertTriangle, CheckCircle, Target, BarChart3, Lightbulb, Award } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { motion } from "framer-motion";
import { TeamStrengthsWeaknesses } from '../components/chatbot/TeamStrengthsWeaknesses';
import { WorkExperienceRecommendations } from '../components/chatbot/WorkExperienceRecommendations';
import { EmployeePerformance } from '../components/chatbot/EmployeePerformance';
import { useAuth } from '../context/AuthContext';
import { teams } from '../data/mockData';

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
  component?: 'insights' | 'strengths' | 'recommendations' | 'performance';
}

const initialMessages: Message[] = [
  {
    id: '1',
    type: 'bot',
    content: 'Hello! 👋 I\'m your AI Team Analytics Assistant. I can help you understand team performance, identify productivity trends, and provide personalized recommendations to improve your team\'s work experience. How can I assist you today?',
    timestamp: new Date(),
  },
];

const quickActions = [
  { id: 'insights', label: 'Show Team Insights', icon: TrendingUp, color: 'from-[#30c2b7] to-[#70e1bf]' },
  { id: 'productivity', label: 'Analyze Team Productivity', icon: BarChart3, color: 'from-[#70e1bf] to-[#96efc1]' },
  { id: 'strengths', label: 'Team Strengths & Weaknesses', icon: Target, color: 'from-[#30c2b7] to-[#96efc1]' },
  { id: 'recommendations', label: 'Work Experience Tips', icon: Lightbulb, color: 'from-[#70e1bf] to-[#30c2b7]' },
  { id: 'critical', label: 'Pending Critical Tasks', icon: AlertTriangle, color: 'from-orange-500 to-red-500' },
  { id: 'performance', label: 'Employee Performance', icon: Award, color: 'from-yellow-500 to-[#30c2b7]' },
];

export function ChatBotPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleActionClick = (actionId: string) => {
    const action = quickActions.find(a => a.id === actionId);
    if (!action) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: action.label,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);

    // Simulate bot response
    setTimeout(() => {
      let botResponse: Message;
      
      switch (actionId) {
        case 'insights':
          botResponse = {
            id: `bot-${Date.now()}`,
            type: 'bot',
            content: 'Here\'s a comprehensive overview of your team\'s productivity insights for this week:',
            timestamp: new Date(),
            component: 'insights',
          };
          break;
        
        case 'productivity':
          botResponse = {
            id: `bot-${Date.now()}`,
            type: 'bot',
            content: 'I\'ve analyzed your team\'s productivity patterns. Here are the key insights:',
            timestamp: new Date(),
            component: 'insights',
          };
          break;
        
        case 'strengths':
          botResponse = {
            id: `bot-${Date.now()}`,
            type: 'bot',
            content: 'Based on team performance data, here are the identified strengths and areas for improvement:',
            timestamp: new Date(),
            component: 'strengths',
          };
          break;
        
        case 'recommendations':
          botResponse = {
            id: `bot-${Date.now()}`,
            type: 'bot',
            content: 'Here are personalized recommendations to improve your team\'s work experience and productivity:',
            timestamp: new Date(),
            component: 'recommendations',
          };
          break;
        
        case 'critical':
          const criticalTasksCount = 5; // Mock data
          botResponse = {
            id: `bot-${Date.now()}`,
            type: 'bot',
            content: `You have ${criticalTasksCount} critical tasks requiring immediate attention. These are high-priority items that could impact sprint goals if not addressed soon.`,
            timestamp: new Date(),
            component: 'insights',
          };
          break;
        
        case 'performance':
          botResponse = {
            id: `bot-${Date.now()}`,
            type: 'bot',
            content: 'Here\'s a detailed breakdown of individual employee performance metrics:',
            timestamp: new Date(),
            component: 'performance',
          };
          break;
        
        default:
          botResponse = {
            id: `bot-${Date.now()}`,
            type: 'bot',
            content: 'I can help you with that! Let me gather the latest data.',
            timestamp: new Date(),
          };
      }
      
      setMessages(prev => [...prev, botResponse]);
    }, 600);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simulate intelligent bot response
    setTimeout(() => {
      let botContent = '';
      const lowerInput = inputValue.toLowerCase();

      if (lowerInput.includes('productivity') || lowerInput.includes('performance')) {
        botContent = 'Let me show you the latest productivity metrics for your team.';
        setMessages(prev => [...prev, {
          id: `bot-${Date.now()}`,
          type: 'bot',
          content: botContent,
          timestamp: new Date(),
          component: 'insights',
        }]);
      } else if (lowerInput.includes('strength') || lowerInput.includes('weakness')) {
        botContent = 'Here\'s an analysis of your team\'s strengths and areas for improvement.';
        setMessages(prev => [...prev, {
          id: `bot-${Date.now()}`,
          type: 'bot',
          content: botContent,
          timestamp: new Date(),
          component: 'strengths',
        }]);
      } else if (lowerInput.includes('recommendation') || lowerInput.includes('improve') || lowerInput.includes('help')) {
        botContent = 'I have some personalized recommendations for your team.';
        setMessages(prev => [...prev, {
          id: `bot-${Date.now()}`,
          type: 'bot',
          content: botContent,
          timestamp: new Date(),
          component: 'recommendations',
        }]);
      } else if (lowerInput.includes('employee') || lowerInput.includes('member') || lowerInput.includes('who')) {
        botContent = 'Here\'s an overview of your team members\' performance.';
        setMessages(prev => [...prev, {
          id: `bot-${Date.now()}`,
          type: 'bot',
          content: botContent,
          timestamp: new Date(),
          component: 'performance',
        }]);
      } else {
        botContent = `I understand you're asking about "${inputValue}". Based on your team's data, I can provide insights on productivity, team strengths, recommendations, or individual performance. Which would you like to explore?`;
        setMessages(prev => [...prev, {
          id: `bot-${Date.now()}`,
          type: 'bot',
          content: botContent,
          timestamp: new Date(),
        }]);
      }
    }, 800);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#30c2b7] to-[#70e1bf] p-6 text-white shadow-lg">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl mb-2 flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <BarChart3 className="w-6 h-6" />
            </div>
            AI Team Analytics Assistant
          </h1>
          <p className="text-[#96efc1]">
            Powered by intelligent data analysis • Helping {user?.name} optimize team performance
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto space-y-4">
              {messages.map((message) => (
                <div key={message.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-5 py-3 ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-[#30c2b7] to-[#70e1bf] text-white shadow-md'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <p className="text-xs mt-1 opacity-60">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                  
                  {/* Component rendering */}
                  {message.component && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="mt-4"
                    >
                      {message.component === 'insights' && <TeamInsightsAnalytics />}
                      {message.component === 'strengths' && <TeamStrengthsWeaknesses />}
                      {message.component === 'recommendations' && <WorkExperienceRecommendations />}
                      {message.component === 'performance' && <EmployeePerformance />}
                    </motion.div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-3">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about team productivity, strengths, recommendations..."
                  className="flex-1 text-base py-6"
                />
                <Button 
                  onClick={handleSendMessage} 
                  size="lg"
                  className="bg-gradient-to-r from-[#30c2b7] to-[#70e1bf] hover:from-[#2bb0a5] hover:to-[#5fd0ad] text-white px-8"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="w-80 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 overflow-y-auto">
          <h3 className="font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-[#30c2b7]" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleActionClick(action.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r ${action.color} text-white shadow-md hover:shadow-lg transition-all`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium text-left">{action.label}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Tips Section */}
          <div className="mt-6 p-4 bg-gradient-to-br from-[#30c2b7]/10 to-[#96efc1]/10 rounded-xl border border-[#30c2b7]/20">
            <h4 className="font-semibold text-sm mb-2 text-gray-900 dark:text-white flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-[#30c2b7]" />
              Pro Tips
            </h4>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
              <li>• Ask specific questions about productivity</li>
              <li>• Request recommendations for team improvements</li>
              <li>• Track individual performance metrics</li>
              <li>• Identify bottlenecks early</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
