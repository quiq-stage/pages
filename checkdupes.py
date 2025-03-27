import requests
from datetime import datetime
from collections import defaultdict
import os

class ZendeskDuplicateChecker:
    def __init__(self, dry_run=True):
        self.dry_run = dry_run

        # CREDENTIALS HERE

    def format_date(self, timestamp):
        if isinstance(timestamp, int):
            dt = datetime.fromtimestamp(timestamp / 1000)
            return dt.strftime("%-m/%-d %-I:%M %p ET")
        else:
            dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            return dt.strftime("%-m/%-d %-I:%M %p ET")

    def get_open_tickets(self):
        """Get all recent open tickets"""
        url = f"https://{self.zendesk_domain}/api/v2/search.json"
        
        # Base subject filter
        subject_filter = 'subject:"Booking ID:" subject:"CID:"'
        
        # Queries for older tickets (2-7 days)
        queries = [
            f"type:ticket status:open {subject_filter} created_at>36hours created_at<=48hours",
            f"type:ticket status:open {subject_filter} created_at>24hours created_at<=36hours",
            f"type:ticket status:open {subject_filter} created_at>12hours created_at<=24hours",
            f"type:ticket status:open {subject_filter} created_at>10hours created_at<=12hours",
            f"type:ticket status:open {subject_filter} created_at>8hours created_at<=10hours",
            f"type:ticket status:open {subject_filter} created_at>6hours created_at<=8hours",
            f"type:ticket status:open {subject_filter} created_at>4hours created_at<=6hours",
            f"type:ticket status:open {subject_filter} created_at>2hours created_at<=4hours",
        ]
        
        # Break down 15min-2hours into 15-minute chunks
        for minutes in range(15, 120, 15):
            next_minutes = minutes + 15
            queries.append(f"type:ticket status:open {subject_filter} created_at>{minutes}minutes created_at<={next_minutes}minutes")
        
        # Break down first 15 minutes into 1-minute chunks
        for minute in range(0, 15):
            next_minute = minute + 1
            if minute == 0:
                queries.append(f"type:ticket status:open {subject_filter} created_at<=1minute")
            else:
                queries.append(f"type:ticket status:open {subject_filter} created_at>{minute}minutes created_at<={next_minute}minutes")
        
        all_tickets = []
        
        for query in queries:
            # print(f"\nSearching with query: {query}")
            next_page = url
            
            while next_page:
                # print(f"Fetching tickets... (Found {len(all_tickets)} so far)")
                
                response = requests.get(
                    next_page,
                    auth=(f"{self.zendesk_email}/token", self.zendesk_token),
                    params={"query": query} if next_page == url else None
                )
                
                if response.status_code != 200:
                    print(f"Error response: {response.text}")
                    raise Exception(f"Failed to fetch tickets: {response.status_code}")
                    
                data = response.json()
                all_tickets.extend(data['results'])
                next_page = data.get('next_page')
        
        # print(f"\nTotal tickets found: {len(all_tickets)}")
        return all_tickets
  
    def add_tag(self, ticket_id, tag):
        """Add a tag to a ticket"""
        if self.dry_run:
            return
            
        url = f"https://{self.zendesk_domain}/api/v2/tickets/{ticket_id}.json"
        
        response = requests.get(url, auth=(f"{self.zendesk_email}/token", self.zendesk_token))
        if response.status_code != 200:
            raise Exception(f"Failed to fetch ticket {ticket_id}: {response.status_code}")
            
        ticket = response.json()['ticket']
        new_tags = ticket['tags'] + [tag]
        
        payload = {
            "ticket": {
                "tags": new_tags
            }
        }
        
        response = requests.put(
            url,
            auth=(f"{self.zendesk_email}/token", self.zendesk_token),
            json=payload
        )
        
        if response.status_code != 200:
            print(f"Failed to add tag to ticket {ticket_id}: {response.status_code}")
            print(f"Response: {response.text}")
        else:
            print(f"Successfully added tag '{tag}' to ticket {ticket_id}")

    def solve_ticket(self, ticket_id):
        """Change a ticket's status to solved"""
        if self.dry_run:
            return
            
        url = f"https://{self.zendesk_domain}/api/v2/tickets/{ticket_id}.json"
        
        payload = {
            "ticket": {
                "status": "solved"
            }
        }
        
        response = requests.put(
            url,
            auth=(f"{self.zendesk_email}/token", self.zendesk_token),
            json=payload
        )
        
        if response.status_code != 200:
            print(f"Failed to solve ticket {ticket_id}: {response.status_code}")
            print(f"Response: {response.text}")
        else:
            print(f"Successfully solved ticket {ticket_id}")

    def get_ticket_last_public_comment_time(self, ticket_id):
        """Get the timestamp of the last public comment on a ticket"""
        url = f"https://{self.zendesk_domain}/api/v2/tickets/{ticket_id}/comments.json"
        
        response = requests.get(
            url,
            auth=(f"{self.zendesk_email}/token", self.zendesk_token)
        )
        
        if response.status_code != 200:
            print(f"Failed to fetch comments for ticket {ticket_id}: {response.status_code}")
            return None
            
        comments = response.json()['comments']
        public_comments = [c for c in comments if c.get('public', False)]
        
        if public_comments:
            return public_comments[-1]['created_at']
        return None

    def extract_ids_from_subject(self, subject):
        """Extract booking ID, conversation ID, and SID from subject line"""
        booking_id = None
        conversation_id = None
        sid = None
        
        if 'Booking ID:' in subject:
            try:
                # Extract booking ID (take just the number part)
                booking_part = subject.split('Booking ID:')[1].split('CID:')[0].strip()
                if 'SID:' in booking_part:
                    booking_id = booking_part.split('SID:')[0].strip()
                    sid = booking_part.split('SID:')[1].strip()
                else:
                    booking_id = booking_part
                
                # Extract conversation ID if present
                if 'CID:' in subject:
                    cid_part = subject.split('CID:')[1].strip()
                    conversation_id = cid_part
            except:
                pass
                
        return booking_id, conversation_id, sid

    def send_to_queue(self, conversation_id):
        """Send a conversation to the duplicates queue"""
        if self.dry_run:
            print(f"[DRY RUN] Would send conversation {conversation_id} to duplicates queue")
            return True

        url = f"https://{self.quiq_domain}/api/v1/messaging/conversations/{conversation_id}/send-to-queue"
        
        payload = {
            "targetQueue": "duplicates",
            "awaitingCustomerResponse": False
        }
        
        response = requests.post(
            url,
            json=payload,
            auth=(os.environ['QUIQ_API_KEY_IDENTITY'], os.environ['QUIQ_API_KEY_SECRET'])
        )
        
        if response.status_code != 200:
            print(f"Failed to send conversation {conversation_id} to queue: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
        print(f"Successfully sent conversation {conversation_id} to duplicates queue")
        return True
    
    def get_quiq_conversation(self, conversation_id):
        """Get conversation details from Quiq"""
        if not conversation_id:
            return None
            
        url = f"https://{self.quiq_domain}/api/v1/messaging/conversation/{conversation_id}"
        
        auth = (os.environ['QUIQ_API_KEY_IDENTITY'], os.environ['QUIQ_API_KEY_SECRET'])
        
        response = requests.get(
            url,
            auth=auth
        )
        
        if response.status_code != 200:
            print(f"Failed to get conversation {conversation_id}: {response.status_code}")
            print(f"Response: {response.text}")  
            return None
            
        return response.json()
   
    def get_last_customer_message_time(self, conversation_data):
        """Get timestamp of last customer message from conversation"""
        if not conversation_data or 'messages' not in conversation_data:
            return None
            
        # Filter for customer messages only
        customer_messages = [msg for msg in conversation_data['messages'] 
                            if msg.get('fromCustomer', False)]
        
        if not customer_messages:
            return None
            
        # Return timestamp of last customer message
        return customer_messages[-1]['timestamp']

    def process_tickets(self):
        # Get all tickets once at the start
        tickets = self.get_open_tickets()
        
        # Group by booking ID
        booking_groups = defaultdict(list)
        for ticket in tickets:
            subject = ticket.get('subject', '')
            booking_id, conversation_id, sid = self.extract_ids_from_subject(subject)
            
            if booking_id:
                ticket['conversation_id'] = conversation_id
                ticket['sid'] = sid
                booking_groups[booking_id].append(ticket)
        
        # Find all booking IDs with duplicates
        duplicate_booking_ids = {bid: tickets for bid, tickets in booking_groups.items() if len(tickets) > 1}
        
        if not duplicate_booking_ids:
            print("No duplicate tickets found!")
            return
        
        # Process each booking ID with duplicates
        for booking_id, ticket_group in duplicate_booking_ids.items():
            # Sort by ticket ID (newer tickets have higher IDs)
            sorted_tickets = sorted(
                ticket_group,
                key=lambda x: int(x['id']),
                reverse=True
            )
            
            newest_ticket = sorted_tickets[0]
            older_tickets = sorted_tickets[1:]
            
            # Print condensed output
            print(f"\n[{'DRY RUN' if self.dry_run else 'LIVE'}] Booking ID: {booking_id}")
            
            # Process each older ticket
            for ticket in older_tickets:
                print(f"Ticket {ticket['id']}")
                print(f"- Status: {ticket['status'].capitalize()}")
                print(f"- Created: {self.format_date(ticket['created_at'])}")
                print("- Add tag 'duplicate_ticket' and solve")
                
                if ticket.get('conversation_id'):
                    # Get Quiq conversation details
                    conversation_data = self.get_quiq_conversation(ticket['conversation_id'])
                    if conversation_data:
                        conversation_status = conversation_data.get('status')
                        print(f"Convo {ticket['conversation_id']}")
                        print(f"- Status: {conversation_data.get('status', 'Unknown').capitalize()}")
                        print(f"- Created: {self.format_date(conversation_data.get('startTime'))}")
                        if ticket.get('conversation_id') and conversation_status == 'Open':
                            print("- Send to duplicates queue")
                        else:
                            print("- No action needed")
                
                if not self.dry_run:
                    self.add_tag(ticket['id'], 'duplicate_ticket')
                    self.solve_ticket(ticket['id'])
                    if ticket.get('conversation_id') and conversation_status == 'Open':
                        self.send_to_queue(ticket['conversation_id'])
            
            # Print primary ticket details
            print(f"Ticket {newest_ticket['id']}")
            print(f"- Status: {newest_ticket['status'].capitalize()}")
            print(f"- Created: {self.format_date(newest_ticket['created_at'])}")
            print("- Add tag 'primary_ticket'")
            
            if not self.dry_run:
                self.add_tag(newest_ticket['id'], 'primary_ticket')

def main():
    checker = ZendeskDuplicateChecker(dry_run=True)  # Set to True for dry run
    checker.process_tickets()

if __name__ == "__main__":
    main()
