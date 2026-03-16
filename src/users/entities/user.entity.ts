import { Role } from '../../roles/entities/role.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    lastName: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    docType: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    docNumber: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    phone: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    avatar: string;

    @Column({ type: 'int', default: 0 })
    loyaltyPoints: number;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'text', nullable: true })
    refreshToken: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToMany(() => Role, role => role.users)
    @JoinTable({
        name: 'user_roles'
    })
    roles: Role[];
}
