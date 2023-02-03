import { compose } from 'redux';

import { withAuthGuard } from '@bao/client/components/Wrappers';
import { ChatConnectedProps, withChatContext } from './Chat.context';
import Chat from './Chat.component';

export const ChatRoomContainer = compose<React.FC<ChatConnectedProps>>(
  withAuthGuard,
  withChatContext
)(Chat);

export default ChatRoomContainer;
