import { IUseCase } from '@shared/core/use-case';
import { Customer } from '@domain/customer';

export interface IChangeEmailCustomerCommand {
	id: string;
	email: string;
}

export interface IOutputPort {
	invalid(error: Error): void;
	notFound(error: Error): void;
	unchanged(error: Error): void;
	changed(customer: Customer): void;
}

export interface IChangeEmailCustomerUseCase
	extends IUseCase<IChangeEmailCustomerCommand, IOutputPort> {}
