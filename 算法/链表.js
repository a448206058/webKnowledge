function ListNode(val, next) {
		 var head = {};
	     head.val = (val===undefined ? 0 : val)
	     head.next = (next===undefined ? null : next)
		 return head
	}
	
	function creatrLink(arr){
		if(arr.length === 0) {
			return null;
		}
		var head = new ListNode(arr[0]);
		var curNode = head;
		for (var i = 1; i < arr.length; i++){
			curNode.next = new ListNode(arr[i]);
			curNode = curNode.next;
		}
		return head;
	}