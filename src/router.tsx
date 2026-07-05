import { createBrowserRouter } from "react-router";
import LoginPage from "./pages/login/login";
import HomePage from "./pages/home/home";
import RootLayout from "./components/layout/root";
import { loginAction } from "./features/auth/auth.actions";
import { requireAdmin } from "./features/auth/auth.utils";
import UsersPage from "./pages/users/users";
import { dashboardLoader } from "./features/stats/dashboard.loaders";
import AIGeminiPage from "./pages/ai/ai";
import { geminiAction } from "./features/ai/ai.actions";
import { AIInstructionLoader } from "./features/ai/ai.loaders";
import AIGeminiLogsPage from "./pages/ai/log/ai-logs";
import { userStatsLoader } from "./features/stats/user.loaders";
import LevelConfigPage from "./pages/level/page";
import { levelConfigLoader } from "./features/level/level.loaders";
import { levelConfigActions } from "./features/level/level.actions";
import QuestionPage from "./pages/question/page";
import { questionsLoader } from "./features/questions/questions.loaders";
import { questionsAction } from "./features/questions/question.actions";
import AnswersPage from "./pages/answer/page";
import { answersLoader } from "./features/answers/answers.loaders";
import QuestsPage from "./pages/quest/page";
import { questsLoader } from "./features/quests/quests.loaders";
import { questTemplateAction } from "./features/quests/quests.actions";
import ActiveQuestsPage from "./pages/quest-daily/page";
import { questsDailyLoader } from "./features/quests-daily/quest-daily.loaders";
import AdminChatPage from "./pages/chat/page";
import { chatsRoomsLoader } from "./features/chat/chats.loaders";
import { GlobalRouteError } from "./components/error/element";
import { chatActions } from "./features/chat/chat.actions";
import SpecialistsPage from "./pages/specialists/page";
import { specialistsPageLoader } from "./features/specialists/specialists.loaders";
import { specialistsPageAction } from "./features/specialists/specialists-page.actions";
import BookingClicksPage from "./pages/specialists/booking-clicks";
import { bookingClicksPageLoader } from "./features/specialists/booking-clicks.loaders";
import EarlyAccessPage from "./pages/early-access/page";
import { earlyAccessPageLoader } from "./features/early-access/early-access.loaders";
import NotificationBroadcastPage from "./pages/notification-broadcast/page";
import CloudPage from "./pages/cloud/page";
import { cloudPageLoader } from "./features/cloud/cloud.loaders";
import WikiPage from "./pages/wiki/page";
import { wikiPageLoader } from "./features/wiki/wiki.loaders";
import { wikiPageAction } from "./features/wiki/wiki.actions";
import AiMemoryPage from "./pages/ai/memory/page";
import { aiMemoryLoader } from "./features/ai-memory/ai-memory.loaders";
import AiOverviewPage from "./pages/ai/overview/page";
import { aiOverviewLoader } from "./features/ai-overview/ai-overview.loaders";
import PaymentsPage from "./pages/payments/page";
import { paymentsPageLoader } from "./features/payments/payments.loaders";
import ReportsPage from "./pages/reports/page";
import { reportsPageLoader } from "./features/reports/reports.loaders";


export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
    action: loginAction,
    errorElement: <GlobalRouteError />,
  },
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <GlobalRouteError />,
    loader: async () => {
      return await requireAdmin();
    },
    children: [
      {
        index: true,
        element: <HomePage />,
        loader: dashboardLoader
      },
      {
        path: 'users',
        element: <UsersPage />,
        loader: userStatsLoader
      },
      {
        path: "ai",
        children: [
          {
            path: "overview",
            element: <AiOverviewPage />,
            loader: aiOverviewLoader,
          },
          {
            index: true,
            element: <AIGeminiPage />,
            action: geminiAction,
            loader: AIInstructionLoader,
          },
          {
            path: "memory",
            element: <AiMemoryPage />,
            loader: aiMemoryLoader,
          },
          {
            path: "logs",
            element: <AIGeminiLogsPage />,
          },
        ],
      },
      {
        path: 'levels',
        element: <LevelConfigPage />,
        loader: levelConfigLoader,
        action: levelConfigActions
      },
      {
        path: 'questions',
        element: <QuestionPage />,
        loader: questionsLoader,
        action: questionsAction
      },
      {
        path: "answers",
        element: <AnswersPage />,
        loader: answersLoader
      },
      {
        path: "quests",
        element: <QuestsPage />,
        loader: questsLoader,
        action: questTemplateAction
      },
      {
        path: "daily-quests",
        element: <ActiveQuestsPage />,
        loader: questsDailyLoader
      },
      {
        path: "rooms",
        element: <AdminChatPage />,
        loader: chatsRoomsLoader,
        action: chatActions
      },
      {
        path: "specialists",
        element: <SpecialistsPage />,
        loader: specialistsPageLoader,
        action: specialistsPageAction
      },
      {
        path: "specialists/booking-clicks",
        element: <BookingClicksPage />,
        loader: bookingClicksPageLoader
      },
      {
        path: "payments",
        element: <PaymentsPage />,
        loader: paymentsPageLoader,
      },
      {
        path: "reports",
        element: <ReportsPage />,
        loader: reportsPageLoader,
      },
      {
        path: "early-access",
        element: <EarlyAccessPage />,
        loader: earlyAccessPageLoader,
      },
      {
        path: "notification-broadcast",
        element: <NotificationBroadcastPage />,
      },
      {
        path: "cloud",
        element: <CloudPage />,
        loader: cloudPageLoader,
      },
      {
        path: "wiki",
        element: <WikiPage />,
        loader: wikiPageLoader,
        action: wikiPageAction,
      },
    ]
  },
]);
