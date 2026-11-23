import { ShieldCheck } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/** Placeholder home screen. Login and the customer/technician tabs come in the next tickets. */
export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 items-center justify-center px-6">
        <View className="h-16 w-16 items-center justify-center rounded-3xl bg-slate-950">
          <ShieldCheck size={28} color="#ffffff" />
        </View>
        <Text className="mt-5 text-3xl font-bold text-slate-950">HomeCare</Text>
        <Text className="mt-2 text-center text-sm leading-6 text-slate-500">
          Nền tảng chăm sóc nhà ở
        </Text>
      </View>
    </SafeAreaView>
  );
}
