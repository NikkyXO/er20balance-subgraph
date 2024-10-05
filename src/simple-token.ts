import {
  Approval as ApprovalEvent,
  Transfer as TransferEvent
} from "../generated/SimpleToken/SimpleToken"
import { Approval, Transfer } from "../generated/schema"
import { fetchAccount } from "./utils"

export function handleApproval(event: ApprovalEvent): void {
  let entity = new Approval(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.spender = event.params.spender
  entity.value = event.params.value

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTransfer(event: TransferEvent): void {
  let entity = new Transfer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.from = event.params.from
  entity.to = event.params.to
  entity.value = event.params.value

  let fromAccount = fetchAccount(entity.from.toHex());
  let toAccount = fetchAccount(entity.to.toHex());

  if (!fromAccount || !toAccount) {
    return;
    }

  fromAccount.balance = fromAccount.balance.minus(event.params.value);
  toAccount.balance = toAccount.balance.plus(event.params.value);

  fromAccount.id = entity.from.toHex();
  toAccount.id = entity.to.toHex();

  fromAccount.save();
  toAccount.save();

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
