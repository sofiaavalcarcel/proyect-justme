import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';


@Entity('wallets')
export class Wallet {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne('Professional', 'wallet', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'professionalId' })
    professional: any;

    @Column()
    professionalId: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    balance: number;

    @Column({ type: 'varchar', length: 10, default: 'USD' })
    currency: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany('Transaction', 'wallet')
    transactions: any[];
}
