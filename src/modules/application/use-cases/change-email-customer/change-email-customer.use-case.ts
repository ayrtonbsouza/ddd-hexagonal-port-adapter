import { ICustomerReadRepository } from '@domain/interfaces/repository/customer-read.repository';
import { ICustomerWriteRepository } from '@domain/interfaces/repository/customer-write.repository';
import {
	IChangeEmailCustomerCommand,
	IChangeEmailCustomerUseCase,
	IOutputPort,
} from '@domain/interfaces/use-case/change-email-customer';
import { CustomerId } from '@domain/value-objets/customer-id';
import { Email } from '@domain/value-objets/email';
import { ChangeEmailCustomerPresenter } from './change-email-customer.presenter';

export class ChangeEmailCustomerUseCase implements IChangeEmailCustomerUseCase {
	private _outputPort: IOutputPort;
	private readonly _customerReadRepository: ICustomerReadRepository;
	private readonly _customerWriteRepository: ICustomerWriteRepository;

	constructor(
		customerReadRepository: ICustomerReadRepository,
		customerWriteRepository: ICustomerWriteRepository
	) {
		this._outputPort = new ChangeEmailCustomerPresenter();
		this._customerReadRepository = customerReadRepository;
		this._customerWriteRepository = customerWriteRepository;
	}

	setOutputPort(outputPort: IOutputPort): void {
		this._outputPort = outputPort;
	}

	async execute(
		transactionId: string,
		request: IChangeEmailCustomerCommand
	): Promise<void> {
		const emailOrError = Email.create(request.email, false);

		if (emailOrError.isFailure) {
			this._outputPort.invalid(new Error(''));
			return;
		}

		const emailUpdated = emailOrError.getValue();

		const customerResult = await this._customerReadRepository.getById(
			CustomerId.create({ id: request.id })
		);

		if (customerResult == null) {
			this._outputPort.notFound(new Error(''));
			return;
		}

		customerResult.updateEmail(emailUpdated);

		await this._customerWriteRepository.update(customerResult);

		this._outputPort.changed(customerResult);
	}
}
