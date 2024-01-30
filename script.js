(function () {
    var CompartmentModel, view;

    CompartmentModel = class CompartmentModel {
        constructor() {
            var buttons, floor, me;
            this.floors = 8;  // Agora são 8 andares (incluindo 2 abaixo do térreo)
            this.compartment = [];
            this.compartmentCount = 2;
            me = this;
            buttons = ((function () {
                var j, upDownButtons;
                upDownButtons = [];
                for (floor = j = me.floors; j >= -1; floor = j += -1) {
                    // Modificado para incluir andares abaixo do térreo
                    let label = floor >= 0 ? floor : 'T';
                    upDownButtons.push(`<div id='floor-buttons-${floor}' class='floor-buttons d-flex align-items-center'><div class="floor-number-container d-flex align-items-center justify-content-center"><label class="floor-number-label">${label}</label></div><button class='button upSide' data-floor='${floor}'><div class='upSide'></div></button><button class='button downSide' data-floor='${floor}'><div class='downSide'></div></button></div>`);
                }
                return upDownButtons;
            })()).join('');
            $('#upDownButtons').empty().append($(buttons)).off('click').on('click', 'button', function () {
                if ($(this).hasClass('on')) {
                    return;
                }
                $(this).toggleClass('on');
                return $(me).trigger('pressed', [
                    {
                        floor: parseInt($(this)[0].dataset.floor),
                        dir: $(this).children().hasClass('upSide') ? 'upSide' : 'downSide'
                    }
                ]);
            });
        }

        clearButton(floor, dir) {
            return $(`#floor-buttons-${floor} > button > div.${dir}`).parent().removeClass('on');
        }

        closestIdleCompartment(floor) {
            var a, compartment, closest, i, lowest, nonmoving;
            nonmoving = (function () {
                var j, len, ref, results;
                ref = this.compartment;
                results = [];
                for (i = j = 0, len = ref.length; j < len; i = ++j) {
                    compartment = ref[i];
                    if (!compartment.moving && !compartment.inMaintenance) {
                        results.push([i + 1, Math.abs(floor - compartment.floor)]);
                    }
                }
                return results;
            }).call(this);
            closest = nonmoving.reduce(function (a, b) {
                if (a[1] <= b[1]) {
                    return a;
                } else {
                    return b;
                }
            });
            lowest = (function () {
                var j, len, results;
                results = [];
                for (j = 0, len = nonmoving.length; j < len; j++) {
                    a = nonmoving[j];
                    if (a[1] === closest[1]) {
                        results.push(a[0]);
                    }
                }
                return results;
            })();
            return lowest[Math.floor(Math.random() * lowest.length)];
        }

        moveCompartment(compartment, floor) {
            var deferred, myCompartment;
            myCompartment = this.compartment;
            deferred = $.Deferred();
            if (this.compartment[compartment - 1].moving) {
                return deferred.reject();
            }
            if (floor < -1 || floor > this.floors) {
                return deferred.reject();
            }
            this.compartment[compartment - 1].moving = true;
            $(`#lift${compartment} .compartment`).animate({
                bottom: `${(floor + 1) * 85}px`  // Ajustado para a posição correta dos andares abaixo do térreo
            }, {
                duration: 300 * Math.abs(myCompartment[compartment - 1].floor - floor),
                easing: 'linear',
                complete: function () {
                    myCompartment[compartment - 1].floor = floor;
                    myCompartment[compartment - 1].moving = false;
                    return deferred.resolve();
                }
            }).delay(50);
            $(`#lift${compartment} .compartment > div`).animate({
                top: `${-425 + (floor + 1) * 85}px`  // Ajustado para a posição correta dos andares abaixo do térreo
            }, {
                duration: 300 * Math.abs(myCompartment[compartment - 1].floor - floor),
                easing: 'linear'
            }).delay(50);
            return deferred;
        }
    };

    view = new CompartmentModel();  // Instância da classe CompartmentModel
    for (let i = 0; i < view.compartmentCount; i++) {
        view.compartment.push({
            floor: 0,  // Inicia no andar "T" (térreo)
            moving: false,
            inMaintenance: false,
        });

        // Criação dinâmica dos compartimentos do elevador
        let dynamicCompartment = `<div id="lift${i + 1}" class="elevator col d-flex justify-content-center"><div class="compartment"><div>`;
        for (let floor = view.floors; floor >= -1; floor--) {
            dynamicCompartment += `<div>${floor >= 0 ? floor : 'T'}</div>`;
        }
        dynamicCompartment += `</div></div></div>`;
        $('#elevators').prepend(dynamicCompartment);
    }

   
    $(view).on('pressed', function (e, { floor, dir }) {
        return view.moveCompartment(view.closestIdleCompartment(floor), floor).then(function () {
            return view.clearButton(floor, dir);
        });
    });
}).call(this);
