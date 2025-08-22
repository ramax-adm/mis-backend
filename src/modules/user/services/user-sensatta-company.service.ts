import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserSensattaCompany } from '../entities/user-sensatta-company.entity';
import { UserRole } from '@/core/enums/user-role.enum';
import { Company } from '@/core/entities/sensatta/company.entity';

@Injectable()
export class UserSensattaCompanyService {
  constructor(
    private readonly datasource: DataSource,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserSensattaCompany)
    private readonly userSensattaCompanyRepository: Repository<UserSensattaCompany>,
  ) {}

  async create({
    userId,
    companyCode,
  }: {
    userId: string;
    companyCode: string;
  }) {
    const existingUser = await this.userRepository.findOneBy({
      id: userId,
    });

    if (!existingUser) {
      throw new ConflictException('A user with this id not exists');
    }
    return this.userSensattaCompanyRepository.save({ companyCode, userId });
  }

  async findByUser({
    user,
    isConsideredOnStock,
  }: {
    user: User;
    isConsideredOnStock?: boolean;
  }) {
    const isUserAdmin = user.role === UserRole.Admin;

    if (isUserAdmin) {
      // query adm
      const qb = this.datasource
        .createQueryBuilder(Company, 'sc') // aqui já basta, não precisa do .from
        .where('1=1')
        .orderBy('sc.sensatta_code::int', 'ASC');

      if (isConsideredOnStock !== undefined) {
        qb.andWhere('sc.is_considered_on_stock = :isConsideredOnStock', {
          isConsideredOnStock,
        });
      }

      return qb.getMany();
    }

    console.log({ user, isConsideredOnStock });

    // query not adm
    const qb = this.datasource
      .createQueryBuilder()
      .from(UserSensattaCompany, 'usc')

      .leftJoinAndSelect('usc.user', 'u')
      .leftJoin(
        'sensatta_companies',
        'sc',
        'usc.company_code = sc.sensatta_code',
      )
      .where('usc.user_id = :userId', { userId: user.id })
      .select('sc.*')
      .orderBy('sc.sensatta_code::int', 'ASC');
    if (isConsideredOnStock !== undefined) {
      qb.andWhere('sc.is_considered_on_stock = :isConsideredOnStock', {
        isConsideredOnStock,
      });
    }

    const dbData = await qb.getRawMany();
    console.log({ dbData });

    return dbData.map((i) => ({
      address: i.address,
      city: i.city,
      createdAt: i.created_at,
      email: i.email,
      fantasyName: i.fantasy_name,
      id: i.id,
      isConsideredOnStock: i.is_considered_on_stock,
      name: i.name,
      neighbourd: i.neighbourd,
      phone: i.phone,
      priceTableNumberCar: i.price_table_number_car,
      priceTableNumberTruck: i.price_table_number_truck,
      sensattaCode: i.sensatta_code,
      stateSubscription: i.state_subscription,
      uf: i.uf,
      zipcode: i.zipcode,
    }));
  }

  async remove({ id }: { id: string }) {
    const existingUserCompany =
      await this.userSensattaCompanyRepository.findOneBy({
        id,
      });

    if (!existingUserCompany) {
      throw new ConflictException('A user company with this id not exists');
    }
    return this.userSensattaCompanyRepository.delete({ id });
  }
}
