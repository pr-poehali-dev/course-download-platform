import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import func2url from '../../../backend/func2url.json';

interface Transaction {
  id: number;
  type: string;
  amount: number;
  description: string;
  created_at: string;
}

interface TransactionsTabProps {
  userId: number;
}

export default function TransactionsTab({ userId }: TransactionsTabProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, [userId]);

  const loadTransactions = async () => {
    try {
      const response = await fetch(`${func2url['user-data']}?user_id=${userId}&action=transactions`);
      const data = await response.json();
      if (data.transactions) {
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    if (type === 'purchase' || type === 'deduction') return 'ArrowDown';
    if (type === 'refill' || type === 'sale') return 'ArrowUp';
    return 'Circle';
  };

  const getTransactionColor = (type: string) => {
    if (type === 'purchase' || type === 'deduction') return 'text-red-500';
    if (type === 'refill' || type === 'sale') return 'text-green-500';
    return 'text-gray-500';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Icon name="Loader2" className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <Icon name="Receipt" className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>История операций пуста</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Receipt" className="h-5 w-5" />
            История баллов
          </CardTitle>
          <CardDescription>
            Все начисления и списания баллов
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className={`mt-1 ${getTransactionColor(transaction.type)}`}>
                  <Icon name={getTransactionIcon(transaction.type)} className="h-5 w-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm mb-1">
                        {transaction.description || 'Операция с баллами'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(transaction.created_at)}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className={`font-bold text-lg ${getTransactionColor(transaction.type)}`}>
                        {transaction.type === 'purchase' || transaction.type === 'deduction' ? '−' : '+'}
                        {Math.abs(transaction.amount)}
                      </p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {transaction.type === 'purchase' && 'Покупка'}
                        {transaction.type === 'refill' && 'Пополнение'}
                        {transaction.type === 'sale' && 'Продажа'}
                        {transaction.type === 'deduction' && 'Списание'}
                        {!['purchase', 'refill', 'sale', 'deduction'].includes(transaction.type) && transaction.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
