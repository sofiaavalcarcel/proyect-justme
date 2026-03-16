import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    JoinColumn,
    PrimaryGeneratedColumn,
} from 'typeorm';


export enum TransactionType {
    PAYMENT = 'payment',
    COMMISSION = 'commission',
    RECHARGE = 'recharge',
    PAYOUT = 'payout',
}

export enum TransactionStatus {
    COMPLETED = 'completed',
    PENDING = 'pending',
    FAILED = 'failed',
}

@Entity('transactions')
export class Transaction {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne('Wallet', 'transactions', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'walletId' })
    wallet: any;

    @Column()
    walletId: number;

    @Column({
        type: 'enum',
        enum: TransactionType,
    })
    type: TransactionType;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    amount: number;

    @Column({ type: 'varchar', length: 500 })
    description: string;

    @Column({
        type: 'enum',
        enum: TransactionStatus,
        default: TransactionStatus.COMPLETED,
    })
    status: TransactionStatus;

    @CreateDateColumn()
    createdAt: Date;
}
