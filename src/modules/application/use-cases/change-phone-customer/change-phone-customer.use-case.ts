import { ICustomerReadRepository } from '@domain/interfaces/repository/customer-read.repository';
import { ICustomerWriteRepository } from '@domain/interfaces/repository/customer-write.repository';
import {
	IChangePhoneCustomerCommand,
	IChangePhoneCustomerUseCase,
	IOutputPort,
} from '@domain/interfaces/use-case/change-phone-customer';
import { CustomerId } from '@domain/value-objets/customer-id';
import { Phone } from '@domain/value-objets/phone';
import { ChangePhoneCustomerPresenter } from './change-phone-customer.presenter';

export class ChangePhoneCustomerUseCase implements IChangePhoneCustomerUseCase {
	private _outputPort: IOutputPort;
	private readonly _customerReadRepository: ICustomerReadRepository;
	private readonly _customerWriteRepository: ICustomerWriteRepository;

	constructor(
		customerReadRepository: ICustomerReadRepository,
		customerWriteRepository: ICustomerWriteRepository
	) {
		this._outputPort = new ChangePhoneCustomerPresenter();
		this._customerReadRepository = customerReadRepository;
		this._customerWriteRepository = customerWriteRepository;
	}

	setOutputPort(outputPort: IOutputPort): void {
		this._outputPort = outputPort;
	}

	async execute(
		transactionId: string,
		request: IChangePhoneCustomerCommand
	): Promise<void> {
		const phoneOrError = Phone.create(request.phone, false);

		if (phoneOrError.isFailure) {
			this._outputPort.invalid(new Error(''));
			return;
		}

		const phoneUpdated = phoneOrError.getValue();

		const customerResult = await this._customerReadRepository.getById(
			CustomerId.create({ id: request.id })
		);

		if (customerResult == null) {
			this._outputPort.notFound(new Error(''));
			return;
		}

		customerResult.updatePhone(phoneUpdated);

		await this._customerWriteRepository.update(customerResult);

		this._outputPort.changed(customerResult);
	}
}
