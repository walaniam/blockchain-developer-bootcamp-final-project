function appendEventDetailsTo(entry, containerSelector, contract) {

    var row = `
    <div class="row" style="width: 100%;">
      <div id="details-${entry.id}" class="col-md-6" style="width: 100%;">
        <h3><span class="glyphicon glyphicon-flash"></span> <a href="/event-details?id=${entry.id}">${entry.title}</a></h3>
        <span>Spots: ${entry.spots}</span><br/>
        <span>Registered count: </span><span id="registered-count-${entry.id}">-</span><br/>
        <span>Registration due date: ${formatDateOf(entry.registrationDueDate)}</span><br/>
        <span>Event date: ${formatDateOf(entry.eventDate)}</span><br/>
        <span>Organizer: ${entry.organizer}</span><br/>
      </div>
      <hr/>
    </div>
  `;

    $(row).appendTo($(containerSelector));

    if (isOrganizer(entry)) {
        $('<div style="margin-top: 5px; margin-bottom: 5px;">You are organizer</div>').appendTo($('#details-' + entry.id));
        getRegistrantsCount(entry.id, contract).then(count => {
            $("#registered-count-" + entry.id).text(count.toString());
        });        
    } else {
        isRegisteredForEntry(entry.id, contract).then(isRegistered => {
            if (isRegistered) {
                $('<span style="margin-top: 10px;">Already registered</span><br/>').appendTo($('#details-' + entry.id));
            } else {
                var button = `<button id="register-button-${entry.id}">Register</button>`;
                $(button).appendTo($('#details-' + entry.id));
                $('#register-button-' + entry.id).click(function () {
                    var eventId = $(this).attr('id').split('-')[2];
                    var errCallback = function (err) {
                        $('#mm-status').html("Failed: " + err.message);
                    };
                    if (confirm("Register for event?")) {
                        registerForEvent(eventId, errCallback, contract)
                            .catch(err => errCallback(err));
                    }
                });
            }
        });
    }

    isEventClosed(entry.id, contract).then(isClosed => {
        if (isClosed) {
            $("<span>Registration closed</span><br/>").appendTo($("#details-" + entry.id));
        } else if (isOrganizer(entry)) {
            var closeButton = `<button id="close-button-${entry.id}">Close registration</button>`;
            $(closeButton).appendTo("#details-" + entry.id);

            if (epochTimeNow() > entry.registrationDueDate) {
                $('#close-button-' + entry.id).click(function () {
                    var eventId = $(this).attr('id').split('-')[2];
                    var errCallback = function (err) {
                        $('#mm-status').html("Failed: " + err.message);
                    };
                    if (confirm("Close event?")) {
                        closeEvent(eventId, errCallback, contract)
                            .catch(err => errCallback(err));
                    }
                });
            } else {
                $("#close-button-" + entry.id).prop('disabled', true).css('color', "#999");
                $("<div>Can be closed after registration due date</div>").insertAfter($("#close-button-" + entry.id));
            }
        }
    });
}

async function getRegistrantsCount(entryId, contract) {
    contract = contract || await getContract(new Web3(window.ethereum));
    let count = await contract.methods.getNumberOfRegisteredUsersForEvent(entryId).call({ from: ethereum.selectedAddress });
    console.log("registered for " + entryId + " count=" + count);
    return count;
}

function isOrganizer(entry) {
    return ethereum.selectedAddress.toLowerCase() == entry.organizer.toLowerCase();
}