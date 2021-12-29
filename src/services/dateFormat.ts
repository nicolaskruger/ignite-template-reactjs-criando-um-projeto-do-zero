import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

export const dateFormat = (date: string): string => {
    return format(new Date(date), 'dd LLL yyyy', {
        locale: ptBR,
    });
};

export const lastDateFormat = (date: string): string => {
    return format(new Date(date), 'HH:mm', {
        locale: ptBR,
    });
};
